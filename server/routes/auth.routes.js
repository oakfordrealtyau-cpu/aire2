import express from 'express';
import {
  registerInit,
  verifyCode,
  resendCode,
  checkAvailability,
  login,
  refresh,
  logout,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/register-init
 * @desc    Initialize seller registration - validate, store pending, send verification code
 * @access  Public
 */
router.post('/register-init', registerInit);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify email code and create user account
 * @access  Public
 */
router.post('/verify', verifyCode);

/**
 * @route   POST /api/auth/resend-code
 * @desc    Resend verification code (rate limited)
 * @access  Public
 */
router.post('/resend-code', resendCode);

/**
 * @route   POST /api/auth/check-availability
 * @desc    Check if email or username is available
 * @access  Public
 */
router.post('/check-availability', checkAvailability);

/**
 * Refresh access token using refresh cookie
 */
router.post('/refresh', refresh);

/**
 * Logout clears refresh cookie
 */
router.post('/logout', logout);

/**
 * Get current user
 */
router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({ success: true, data: req.user });
});

export default router;
