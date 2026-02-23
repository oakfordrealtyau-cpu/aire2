import { authAPI } from '../services/api';

/**
 * Helpers for client-side session validation / tamper-detection.
 * Mirrors the patterns used by `AuthContext.jsx` (token in localStorage + /auth/me on the server).
 */

export function getStoredUser() {
  try {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  } catch (e) {
    console.error('getStoredUser parse failed', e);
    return null;
  }
}

export function storeUser(user) {
  if (!user || !user.id) return false;
  try {
    const normalized = {
      ...user,
      firstName: user.firstName ?? user.first_name,
      lastName: user.lastName ?? user.last_name,
      roles: Array.isArray(user.roles)
        ? user.roles.map(r => (typeof r === 'string' ? r.toLowerCase() : String(r)))
        : user.roles
        ? [String(user.roles).toLowerCase()]
        : [],
    };
    localStorage.setItem('user', JSON.stringify(normalized));
    return true;
  } catch (e) {
    console.error('storeUser failed', e);
    return false;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastLoginAt');
  } catch (e) {
    /* ignore */
  }
}

/**
 * Call server /auth/me to verify that local session still matches server state.
 * Returns { isValid: boolean, user: object|null, reason?: string }
 * - If no token is present we return { isValid: true, user: null } (not logged in)
 * - If server returns 401 we treat it as unauthenticated (user: null)
 */
export async function validateUserSession() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { isValid: true, user: null };

    const storedUser = getStoredUser();
    const res = await authAPI.getMe();
    const serverUser = res.data?.data || res.data || null;

    if (!serverUser || !serverUser.id) {
      clearSession();
      return { isValid: false, reason: 'No user data from server' };
    }

    const normalized = {
      ...serverUser,
      roles: Array.isArray(serverUser.roles)
        ? serverUser.roles.map(r => (typeof r === 'string' ? r.toLowerCase() : String(r)))
        : serverUser.roles
        ? [String(serverUser.roles).toLowerCase()]
        : [],
    };

    if (storedUser && storedUser.id !== normalized.id) {
      clearSession();
      return { isValid: false, reason: 'User ID mismatch - potential session hijack' };
    }

    // Sync stored user if missing or changed
    try {
      storeUser(normalized);
    } catch (e) {}

    return { isValid: true, user: normalized };
  } catch (err) {
    if (err?.response?.status === 401) {
      // Not authenticated on server — return user: null so caller can treat as logged-out
      return { isValid: true, user: null };
    }
    console.error('validateUserSession error', err);
    return { isValid: false, reason: err?.message || 'Network error' };
  }
}

export function isRoleTampered(user) {
  const stored = getStoredUser();
  if (!stored || !user) return false;
  if (stored.role_id !== undefined && user.role_id !== undefined) {
    return Number(stored.role_id) !== Number(user.role_id);
  }
  // Fallback: compare primary role strings/arrays
  const sRoles = Array.isArray(stored.roles) ? stored.roles.map(r => String(r).toLowerCase()) : [String(stored.role || stored.role_id || '')];
  const uRoles = Array.isArray(user.roles) ? user.roles.map(r => String(r).toLowerCase()) : [String(user.role || user.role_id || '')];
  return JSON.stringify(sRoles) !== JSON.stringify(uRoles);
}

export function isTokenValid() {
  const t = localStorage.getItem('token');
  if (!t) return false;
  return t.split('.').length === 3;
}

/**
 * Optional developer helper: watch localStorage for tampering and clear session if detected.
 * Call from top-level component if desired.
 */
export function enableSessionProtection(intervalMs = 5000) {
  let original = getStoredUser();
  return setInterval(() => {
    const current = getStoredUser();
    if (!original && current) original = current;
    if (!original || !current) return;
    if (original.id !== current.id || original.role_id !== current.role_id) {
      console.error('SECURITY: Local session tampering detected — clearing session');
      clearSession();
      try { window.location.replace('/auth?mode=login'); } catch (e) {}
    }
  }, intervalMs);
}
