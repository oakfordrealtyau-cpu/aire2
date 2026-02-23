
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import { requireAuth } from './middleware/auth.js';
import { securityMiddleware, authLimiter } from './middleware/security.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.routes.js';

// TEMPORARY: hardcode JWT secret when not provided via ENV (safe for quick testing only)
// IMPORTANT: remove this before production or set JWT_SECRET in your deployment provider (Vercel, Railway, etc.)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'temporary_jwt_secret_change_me_2026';
  console.warn('⚠️ JWT_SECRET missing — using temporary hardcoded secret. Replace with secure ENV variable.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Security Middleware =====
app.use(helmet());
app.use(securityMiddleware);
app.use(cors({
  // include whatever ports the frontend may run on during development
  origin: ["https://or-ai-re.vercel.app", "http://localhost:8080", "http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ===== Health Check =====
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AI-RE HUB API'
  });
});

// ===== Auth Routes =====
// Apply a dedicated auth limiter to protect login/refresh/me endpoints from bursts
app.use('/api/auth', authLimiter, authRoutes);

// ===== Admin Routes =====
app.use('/api/admin', requireAuth, adminRoutes);

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`\nAI-RE HUB API SERVER running on port ${PORT}`);
});

export default app;
