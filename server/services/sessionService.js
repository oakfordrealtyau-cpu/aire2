import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const ACCESS_TOKEN_EXPIRES_MS = process.env.ACCESS_TOKEN_EXPIRES_MS ? Number(process.env.ACCESS_TOKEN_EXPIRES_MS) : 24 * 60 * 60 * 1000; // 24h default

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || '';
}

export async function createSessionAndCookie(res, userId, roles, req, opts = {}) {
  const connection = await pool.getConnection();
  try {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const userAgent = req.headers['user-agent'] || '';
    const ip = getClientIp(req) || '';
    const expiresAt = new Date(Date.now() + (opts.expiresMs || ACCESS_TOKEN_EXPIRES_MS));

    await connection.execute(
      `INSERT INTO sessions (session_id, user_id, user_agent, ip_address, expires_at, valid)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [sessionId, userId, userAgent, ip, expiresAt]
    );

    const expiresInSec = Math.floor((opts.expiresMs || ACCESS_TOKEN_EXPIRES_MS) / 1000);
    const token = jwt.sign({ userId, roles, sessionId }, JWT_SECRET, { expiresIn: expiresInSec });

    const isProd = process.env.NODE_ENV === 'production';
    // determine whether the incoming connection is secure (HTTPS)
    const isSecureRequest = req.secure || req.headers['x-forwarded-proto'] === 'https';
    // To support cross‑origin requests from our frontend during development
    // we need the refresh cookie to be sent even when the client and server
    // run on different ports/hosts. Browsers treat such requests as "cross-
    // site" and will only attach cookies if the cookie has `SameSite=None`.
    // Older dev setups used `Lax` to avoid the Secure requirement, but that
    // prevented the cookie from ever being stored on POST/XHR requests.
    //
    // We now always set `SameSite: 'None'`. In production the spec requires
    // Secure as well, so we keep `secure: true` there. In development we
    // still set `secure: false` (because we typically run over HTTP) but
    // modern browsers will issue a warning rather than reject the cookie.
    // This allows the refresh token to be written and later used to restore
    // sessions after a browser refresh.
    const cookieOptions = {
      httpOnly: true,
      // only mark secure if we're actually on https and in production;
      // otherwise cookies set on localhost/http will be usable by the browser.
      secure: isProd && isSecureRequest,
      // we need the refresh token to be sent on AJAX/fetch requests; using
      // `SameSite=None` without Secure on HTTP, the cookie is still set and
      // works correctly in development. keep `None` always so our client
      // can rely on the cookie being present.
      sameSite: 'None',
      maxAge: opts.maxAge || (opts.expiresMs || ACCESS_TOKEN_EXPIRES_MS),
      path: '/',
    };

    // Development-only debug: log when we set the refresh cookie so client-side failures
    // ("No refresh token") can be correlated with server behavior. Avoid logging cookie
    // value in production.
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.debug(`[SessionService] setting refreshToken cookie (sessionId=${sessionId.slice(0, 8)}..., secure=${cookieOptions.secure}, sameSite=${cookieOptions.sameSite}, maxAge=${cookieOptions.maxAge})`);
      } catch (e) { /* ignore logging failure */ }
    }

    res.cookie('refreshToken', sessionId, cookieOptions);

    return token;
  } finally {
    connection.release();
  }
}

export async function invalidateSession(sessionId) {
  if (!sessionId) return;
  await pool.execute('UPDATE sessions SET valid = 0 WHERE session_id = ?', [sessionId]);
}

export async function findSession(sessionId) {
  if (!sessionId) return null;
  // Only return session if it's marked valid and not expired
  const [rows] = await pool.execute(
    'SELECT * FROM sessions WHERE session_id = ? AND valid = 1 AND (expires_at IS NULL OR expires_at > NOW())',
    [sessionId]
  );
  return rows.length > 0 ? rows[0] : null;
}
