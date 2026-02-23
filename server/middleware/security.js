import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';

// Centralized security middleware used by app
export const securityMiddleware = [
  // CORS: allow origin from env in production, allow all during development
  cors({
    origin: process.env.NODE_ENV === 'production' ? (process.env.CORS_ORIGIN || '') : true,
    credentials: true,
  }),
  // Basic rate limiting (global). Increased default to reduce false positives
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.GLOBAL_RATE_LIMIT_MAX) || 1000,
    standardHeaders: true,
    legacyHeaders: false,
    // Skip the global limiter for auth routes — they have a dedicated limiter
    skip: (req) => typeof req.path === 'string' && req.path.startsWith('/api/auth'),
    handler: (req, res /*, next */) => {
      const retryAfterSec = Number(process.env.GLOBAL_RETRY_AFTER_SEC) || 60; // default 60s
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({ success: false, message: 'Too many requests, please try again later.' });
    },
  }),
];

// Specialized limiter for auth endpoints (protects login/refresh/me)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res /*, next */) => {
    // suggest a shorter retry window for auth endpoints
    const retryAfterSec = Number(process.env.AUTH_RETRY_AFTER_SEC) || 30; // default 30s
    res.set('Retry-After', String(retryAfterSec));
    return res.status(429).json({ success: false, message: 'Too many auth requests — please try again later.' });
  },
});

// validateBody and validateQuery expect a Zod schema (or null) and will
// run async parsing - return 400 on validation errors with details.
export function validateBody(schema) {
  return async (req, res, next) => {
    if (!schema) return next();
    try {
      // allow async parsing and transform
      req.body = await schema.parseAsync(req.body || {});
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ success: false, message: 'Invalid request body', errors: err.errors });
      }
      return next(err);
    }
  };
}

export function validateQuery(schema) {
  return async (req, res, next) => {
    if (!schema) return next();
    try {
      req.query = await schema.parseAsync(req.query || {});
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ success: false, message: 'Invalid query parameters', errors: err.errors });
      }
      return next(err);
    }
  };
}
