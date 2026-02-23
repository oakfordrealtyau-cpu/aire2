import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { findSession } from '../services/sessionService.js';

export async function requireAuth(req, res, next) {
  // primary: access token in Authorization header or cookie named 'token'
  let token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

  // if no access token but a refresh cookie exists, try to authenticate by session
  const refreshCookie = req.cookies.refreshToken;
  if (!token && refreshCookie) {
    // look up session; if valid, build req.user and allow through
    const session = await findSession(refreshCookie);
    if (session) {
      try {
        const [[userRow]] = await db.execute(
          'SELECT id, first_name, last_name, email FROM users WHERE id = ?',
          [session.user_id]
        );
        if (userRow) {
          // load roles similarly to login controller
          const [roleRows] = await db.execute(
            `SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`,
            [userRow.id]
          );
          const roles = roleRows.map(r => r.name);
          if (roles.length === 0) roles.push('buyer');

          req.user = {
            id: userRow.id,
            firstName: userRow.first_name,
            lastName: userRow.last_name,
            email: userRow.email,
            roles,
          };
          return next();
        }
      } catch (e) {
        console.warn('requireAuth session lookup failed', e);
      }
    }
    // fall through to error if session missing or user not found
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  // Development-only: accept fake_jwt_token_<id>_<ts> for local dev/testing
  if (process.env.NODE_ENV !== 'production' && typeof token === 'string' && token.startsWith('fake_jwt_token_')) {
    try {
      const parts = token.split('_');
      const id = Number(parts[3] || parts[2]) || null;
      req.user = {
        id,
        role: 'admin',
        roles: ['admin'],
        permissions: ['LISTING_APPROVE', 'DOC_VERIFY', 'OFFER_REVIEW'],
      };
      return next();
    } catch (e) {
      // fallthrough to normal verification
    }
  }

  try {
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev_jwt_secret' : null);
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }

    const decoded = jwt.verify(token, secret);

    // If token includes a sessionId, ensure the session is still valid in DB
    if (decoded.sessionId) {
      const session = await findSession(decoded.sessionId);
      if (!session) {
        return res.status(401).json({ message: 'Session invalid or expired' });
      }
      // Optional: verify session.user_id matches token userId
      if (decoded.userId && session.user_id !== decoded.userId) {
        return res.status(401).json({ message: 'Session user mismatch' });
      }

      // Enrich req.user with fresh profile from DB
      try {
        const [[userRow]] = await db.execute('SELECT id, first_name, last_name, email FROM users WHERE id = ?', [session.user_id]);
        if (userRow) {
          req.user = {
            id: userRow.id,
            firstName: userRow.first_name,
            lastName: userRow.last_name,
            email: userRow.email,
            roles: decoded.roles || [],
            permissions: decoded.permissions || [],
          };
          return next();
        }
      } catch (e) {
        // fallthrough to using decoded payload
        console.warn('Failed to fetch user profile in requireAuth', e);
      }
    }

    // Attach decoded payload as fallback
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ message: 'Access denied: not authenticated' });
    const hasRole = (Array.isArray(req.user.roles) && req.user.roles.includes(role)) || req.user.role === role;
    if (!hasRole) {
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }
    next();
  };
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ message: 'Access denied: not authenticated' });
    const isSuper = (Array.isArray(req.user.roles) && req.user.roles.includes('superAdmin')) || req.user.role === 'superAdmin';
    if (isSuper) return next();
    const has = Array.isArray(req.user.permissions) && req.user.permissions.includes(permission);
    if (!has) {
      return res.status(403).json({ message: 'Access denied: insufficient permission' });
    }
    next();
  };
}



              