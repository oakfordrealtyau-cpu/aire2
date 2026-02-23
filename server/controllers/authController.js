import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail, sendWelcomeEmail } from '../services/emailService.js';
import { createSessionAndCookie, findSession, invalidateSession } from '../services/sessionService.js';

const SALT_ROUNDS = 12;
const CODE_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFICATION_ATTEMPTS = 5;

/**
 * Generate a 6-digit verification code
 */
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Validate Australian mobile number
 * Accepts: 04xxxxxxxx or +614xxxxxxxx
 */
const validateAustralianMobile = (mobile) => {
  const cleanMobile = mobile.replace(/\s/g, '');
  const auMobileRegex = /^(\+61|0)4\d{8}$/;
  return auMobileRegex.test(cleanMobile);
};

/**
 * Validate Australian postcode (4 digits)
 */
const validateAustralianPostcode = (postcode) => {
  return /^\d{4}$/.test(postcode);
};

/**
 * Sanitize and generate username from first and last name
 */
const generateUsername = (firstName, lastName) => {
  return `${firstName}${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 50);
};

/**
 * Validate password strength
 * Min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
const validatePasswordStrength = (password) => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return {
    valid: minLength && hasUppercase && hasLowercase && hasNumber,
    errors: {
      minLength: !minLength ? 'Password must be at least 8 characters' : null,
      hasUppercase: !hasUppercase ? 'Password must contain an uppercase letter' : null,
      hasLowercase: !hasLowercase ? 'Password must contain a lowercase letter' : null,
      hasNumber: !hasNumber ? 'Password must contain a number' : null,
    }
  };
};

/**
 * POST /api/auth/register-init
 * Initialize registration: validate, store pending, send verification code
 */
export const registerInit = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      firstName,
      lastName,
      username: customUsername,
      address,
      suburb,
      postcode,
      mobile,
      email,
      password,
      confirmPassword
    } = req.body;

    // ===== Server-side Validation =====
    const errors = {};

    // Required field validation
    if (!firstName?.trim()) errors.firstName = 'First name is required';
    if (!lastName?.trim()) errors.lastName = 'Last name is required';
    if (!address?.trim()) errors.address = 'Address is required';
    if (!suburb?.trim()) errors.suburb = 'Suburb is required';
    if (!postcode?.trim()) errors.postcode = 'Postcode is required';
    if (!mobile?.trim()) errors.mobile = 'Mobile number is required';
    if (!email?.trim()) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';

    // Format validation
    if (postcode && !validateAustralianPostcode(postcode)) {
      errors.postcode = 'Postcode must be 4 digits';
    }

    if (mobile && !validateAustralianMobile(mobile)) {
      errors.mobile = 'Please enter a valid Australian mobile (04xxxxxxxx or +614xxxxxxxx)';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (password) {
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        const firstError = Object.values(passwordValidation.errors).find(e => e);
        errors.password = firstError;
      }
    }

    // Generate or validate username
    const username = customUsername?.trim() 
      ? customUsername.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 50)
      : generateUsername(firstName || '', lastName || '');

    if (username && !/^[a-z0-9_]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (username && username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    // Return validation errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    await connection.beginTransaction();

    // ===== Check for duplicates =====
    const [existingEmail] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingEmail.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
        errors: { email: 'This email is already registered. Please try another one.' }
      });
    }

    /* Username check removed as column does not exist
    const [existingUsername] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsername.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'This username is already taken',
        errors: { username: 'Username is already taken' }
      });
    }
    */

    // ===== Generate verification code =====
    const verificationCode = generateVerificationCode();
    const codeHash = await bcrypt.hash(verificationCode, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
    const resendAvailableAt = new Date(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);

    // Payload to store (password will be hashed on final verification)
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username,
      address: address.trim(),
      suburb: suburb.trim(),
      postcode: postcode.trim(),
      mobile: mobile.replace(/\s/g, ''),
      email: email.toLowerCase().trim(),
      password // Will be hashed when verified
    };

    // ===== Upsert pending verification =====
    await connection.execute(
      `INSERT INTO email_verifications (email, code_hash, expires_at, resend_available_at, attempt_count, payload_json)
       VALUES (?, ?, ?, ?, 0, ?)
       ON DUPLICATE KEY UPDATE 
         code_hash = VALUES(code_hash),
         expires_at = VALUES(expires_at),
         resend_available_at = VALUES(resend_available_at),
         attempt_count = 0,
         payload_json = VALUES(payload_json),
         updated_at = CURRENT_TIMESTAMP`,
      [email.toLowerCase(), codeHash, expiresAt, resendAvailableAt, JSON.stringify(payload)]
    );

    await connection.commit();

    // ===== Send verification email =====
    await sendVerificationEmail(email, firstName, verificationCode);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      data: {
        email: email.toLowerCase(),
        expiresIn: CODE_EXPIRY_MINUTES * 60, // seconds
        resendAvailableIn: RESEND_COOLDOWN_SECONDS // seconds
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Register init error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  } finally {
    connection.release();
  }
};

/**
 * POST /api/auth/verify
 * Verify code and create user account
 */
export const verifyCode = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: 'Request body is missing. Please send JSON with email and code.'
    });
  }

  const connection = await pool.getConnection();
  try {
    const { email, code } = req.body || {};
    if (!email?.trim() || !code?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    await connection.beginTransaction();

    // ===== Fetch pending verification =====
    const [verifications] = await connection.execute(
      `SELECT * FROM email_verifications WHERE email = ?`,
      [email.toLowerCase()]
    );
    if (verifications.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'No pending verification found. Please register again.'
      });
    }
    const verification = verifications[0];
    // ===== Check attempt count (brute-force protection) =====
    if (verification.attempt_count >= MAX_VERIFICATION_ATTEMPTS) {
      await connection.rollback();
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new code.'
      });
    }
    // ===== Check expiry =====
    if (new Date(verification.expires_at) < new Date()) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }
    // ===== Verify code =====
    const isCodeValid = await bcrypt.compare(code, verification.code_hash);
    if (!isCodeValid) {
      // Increment attempt count
      await connection.execute(
        `UPDATE email_verifications SET attempt_count = attempt_count + 1 WHERE email = ?`,
        [email.toLowerCase()]
      );
      await connection.commit();
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please try again.',
        attemptsRemaining: MAX_VERIFICATION_ATTEMPTS - verification.attempt_count - 1
      });
    }
    // ===== Parse payload and create user =====
    const payload = JSON.parse(verification.payload_json);
    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
    // Insert user with all address information
    const [userResult] = await connection.execute(
      `INSERT INTO users (
        email, password_hash, first_name, last_name,
        phone, address, suburb, postcode, mobile,
        email_verified, email_verified_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), TRUE)`,
      [
        payload.email,
        passwordHash,
        payload.firstName,
        payload.lastName,
        payload.mobile, // phone field
        payload.address,
        payload.suburb,
        payload.postcode,
        payload.mobile
      ]
    );
    const userId = userResult.insertId;
    // Assign seller role (role_id = 2 for seller)
    await connection.execute(
      `INSERT INTO user_roles (user_id, role_id) VALUES (?, 2)`,
      [userId]
    );
    // Delete verification record
    await connection.execute(
      `DELETE FROM email_verifications WHERE email = ?`,
      [email.toLowerCase()]
    );
    await connection.commit();
    // Send welcome email (non-blocking)
    sendWelcomeEmail(payload.email, payload.firstName).catch(console.error);
    return res.status(200).json({
      success: true,
      message: 'Email verified and account created successfully!',
      data: {
        userId,
        email: payload.email,
        username: payload.username
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Verify code error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  } finally {
    connection.release();
  }
};

/**
 * POST /api/auth/resend-code
 * Resend verification code with rate limiting
 */
export const resendCode = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    await connection.beginTransaction();

    // ===== Fetch pending verification =====
    const [verifications] = await connection.execute(
      `SELECT * FROM email_verifications WHERE email = ?`,
      [email.toLowerCase()]
    );

    if (verifications.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'No pending verification found. Please register again.'
      });
    }

    const verification = verifications[0];

    // ===== Check resend cooldown =====
    const resendAvailable = new Date(verification.resend_available_at);
    const now = new Date();

    if (resendAvailable > now) {
      const waitSeconds = Math.ceil((resendAvailable - now) / 1000);
      await connection.rollback();
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting a new code`,
        retryAfter: waitSeconds
      });
    }

    // ===== Generate new code =====
    const verificationCode = generateVerificationCode();
    const codeHash = await bcrypt.hash(verificationCode, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
    const resendAvailableAt = new Date(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);

    // Update verification record
    await connection.execute(
      `UPDATE email_verifications 
       SET code_hash = ?, expires_at = ?, resend_available_at = ?, attempt_count = 0, updated_at = CURRENT_TIMESTAMP
       WHERE email = ?`,
      [codeHash, expiresAt, resendAvailableAt, email.toLowerCase()]
    );

    await connection.commit();

    // Get first name from payload for email
    const payload = JSON.parse(verification.payload_json);

    // Send new verification email
    await sendVerificationEmail(email, payload.firstName, verificationCode);

    return res.status(200).json({
      success: true,
      message: 'New verification code sent to your email',
      data: {
        expiresIn: CODE_EXPIRY_MINUTES * 60,
        resendAvailableIn: RESEND_COOLDOWN_SECONDS
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Resend code error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  } finally {
    connection.release();
  }
};

/**
 * POST /api/auth/check-availability
 * Check if email or username is available
 */
export const checkAvailability = async (req, res) => {
  try {
    const { email, username } = req.body;

    const result = { available: true };

    if (email) {
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email.toLowerCase()]
      );
      result.emailAvailable = existing.length === 0;
      if (!result.emailAvailable) result.available = false;
    }

    if (username) {
      // Username check skipped as column does not exist
      result.usernameAvailable = true; 
    }

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Check availability error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        errors: {
          email: !email ? 'Email is required' : '',
          password: !password ? 'Password is required' : ''
        }
      });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
        errors: { email: 'Please enter a valid email address' }
      });
    }

    const connection = await pool.getConnection();

    try {
      const [userRows] = await connection.execute(
        `SELECT * FROM users WHERE email = ? AND is_active = TRUE`,
        [email.toLowerCase()]
      );

      if (userRows.length === 0) {
        console.warn('Login attempt - no user found for email:', email);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          errors: { email: 'No account found with this email address' }
        });
      }

      const user = userRows[0];

      // Check if user is verified
      if (!user.email_verified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email address before logging in',
          errors: { email: 'Email address not verified' }
        });
      }

      // Determine password hash field (tolerate different schema names)
      const passwordHash = user.password_hash || user.password || user.pass || user.password_hash_hash;
      if (!passwordHash) {
        console.error('Login error: password hash column not found for user', { userId: user.id });
        return res.status(500).json({ success: false, message: 'Server misconfigured: password field missing' });
      }
      // Verify password
      const passwordMatch = await bcrypt.compare(password, passwordHash);
      if (!passwordMatch) {
        console.warn('Login attempt - incorrect password for email:', email);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          errors: { password: 'Incorrect password' }
        });
      }

      // Update last login
      await connection.execute(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Get user roles
      const [roleRows] = await connection.execute(
        `SELECT r.name FROM roles r 
         JOIN user_roles ur ON r.id = ur.role_id 
         WHERE ur.user_id = ?`,
        [user.id]
      );
      const userRoles = roleRows.map(row => row.name);
      
      // If no roles assigned, default to 'buyer'
      if (userRoles.length === 0) {
        userRoles.push('buyer');
      }

      // Generate JWT token (you'll need to implement this)
      // For now, we'll just return user data
      const userData = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        roles: userRoles,
        isVerified: !!user.email_verified,
        createdAt: user.created_at,
        lastLogin: new Date().toISOString()
      };

      console.log('User Data:', userData);
      // Create a DB-backed session, set cookie, and produce a signed access token
      const expiresMs = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const token = await createSessionAndCookie(res, user.id, userRoles, req, { expiresMs });

      // Development-only debug: confirm server attempted to set refresh cookie for this login
      if (process.env.NODE_ENV !== 'production') {
        try {
          console.debug(`[AuthController] login: created session for user=${user.id}, tokenPrefix=${String(token || '').slice(0,8)}...`);
        } catch (e) { /* ignore */ }
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: userData,
        token: token,
        expiresIn: remember ? '30d' : '24h'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Login error:', error && error.stack ? error.stack : error);
    // Return error message for easier debugging (can be tightened for production)
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
      error: error?.message || String(error)
    });
  }
};

/**
 * POST /api/auth/refresh
 * Rotate refresh token and issue new access token
 */
export const refresh = async (req, res) => {
  try {
    const sessionId = req.cookies?.refreshToken;
    if (!sessionId) return res.status(401).json({ success: false, message: 'No refresh token' });

    // Development-only: accept fake_refresh_<id>_<ts> for local dev/testing
    if (process.env.NODE_ENV !== 'production' && typeof sessionId === 'string' && sessionId.startsWith('fake_refresh_')) {
      const parts = sessionId.split('_');
      const id = Number(parts[2]) || Number(parts[3]) || null;
      if (!id) return res.status(401).json({ success: false, message: 'Invalid refresh token' });

      const newToken = `fake_jwt_token_${id}_${Date.now()}`;
      const newRefresh = generateRefreshToken(id);
      const isProd = process.env.NODE_ENV === 'production';
      // refresh token update (dev fake flow) – always allow cross-site cookies
      res.cookie('refreshToken', newRefresh, { httpOnly: true, secure: isProd, sameSite: 'None', maxAge: 30 * 24 * 60 * 60 * 1000 });
      const userData = { id, role: 'admin', roles: ['admin'] };
      return res.status(200).json({ success: true, data: { token: newToken, user: userData } });
    }

    // Production flow: verify session exists and is valid
    const session = await findSession(sessionId);
    if (!session) {
      // Clear cookie if session not found/expired
      res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'None' });
      return res.status(401).json({ success: false, message: 'Session invalid or expired' });
    }

    // Fetch user and roles
    const [users] = await pool.execute('SELECT id, first_name, last_name, email FROM users WHERE id = ?', [session.user_id]);
    if (users.length === 0) {
      await invalidateSession(sessionId).catch(console.error);
      res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'None' });
      return res.status(401).json({ success: false, message: 'User not found for session' });
    }
    const userRow = users[0];

    const [roleRows] = await pool.execute(
      `SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`,
      [userRow.id]
    );
    const roles = roleRows.map(r => r.name);
    if (roles.length === 0) roles.push('buyer');

    // Issue new access token (keep same sessionId)
    const ACCESS_TOKEN_EXPIRES_MS = process.env.ACCESS_TOKEN_EXPIRES_MS ? Number(process.env.ACCESS_TOKEN_EXPIRES_MS) : 24 * 60 * 60 * 1000;
    const expiresInSec = Math.floor(ACCESS_TOKEN_EXPIRES_MS / 1000);
    const token = jwt.sign({ userId: userRow.id, roles, sessionId }, process.env.JWT_SECRET || 'dev_jwt_secret', { expiresIn: expiresInSec });

    // Refresh cookie: keep same sessionId but update cookie maxAge to match DB expiry
    const now = Date.now();
    const cookieMaxAge = session.expires_at ? Math.max(new Date(session.expires_at).getTime() - now, 0) : ACCESS_TOKEN_EXPIRES_MS;
    const isProd = process.env.NODE_ENV === 'production';
    // always set SameSite=None for refresh cookie so cross-origin calls work
    // production/normal refresh update
res.cookie('refreshToken', sessionId, { httpOnly: true, secure: isProd, sameSite: 'None', maxAge: cookieMaxAge });

    const userData = {
      id: userRow.id,
      firstName: userRow.first_name,
      lastName: userRow.last_name,
      email: userRow.email,
      roles,
    };

    return res.status(200).json({ success: true, data: { token, user: userData } });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(500).json({ success: false, message: 'Unable to refresh token' });
  }
};

/**
 * POST /api/auth/logout
 * Clear refresh cookie
 */
export const logout = async (req, res) => {
  try {
    const sessionId = req.cookies?.refreshToken;
    if (sessionId) {
      await invalidateSession(sessionId).catch(console.error);
    }
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'None' });
    return res.status(200).json({ success: true, message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ success: false, message: 'Logout failed' });
  }
};
