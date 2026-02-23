import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { authAPI } from '../services/api';
import { validateUserSession, clearSession as clearLocalSession, isRoleTampered, getStoredUser, storeUser } from '../utils/sessionValidator';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Probe whether the browser actually has a server-set refresh cookie.
  // We cannot read HttpOnly cookies directly, so perform a lightweight
  // `/auth/refresh` probe and set/clear a small localStorage flag accordingly.
  const probeRefreshCookie = async () => {
    try {
      const res = await authAPI.refresh();
      const token = res.data?.data?.token;
      const serverUser = res.data?.data?.user || null;
      if (token) {
        try { localStorage.setItem('token', token); } catch (e) {}
      }
      if (serverUser) {
        const normalizedUser = {
          ...serverUser,
          roles: Array.isArray(serverUser.roles)
            ? serverUser.roles.map(r => (typeof r === 'string' ? r.toLowerCase() : String(r)))
            : serverUser.roles ? [String(serverUser.roles).toLowerCase()] : [],
        };
        try { localStorage.setItem('user', JSON.stringify(normalizedUser)); } catch (e) {}
        setUser(normalizedUser);
      }
      try { localStorage.setItem('hasRefreshCookie', '1'); } catch (e) {}
      console.debug('[Auth] refresh-cookie probe: cookie present');
      return true;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        try { localStorage.removeItem('hasRefreshCookie'); } catch (e) {}
        console.debug('[Auth] refresh-cookie probe: no refresh token');
      } else {
        console.debug('[Auth] refresh-cookie probe: transient error', err?.message || err);
      }
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      console.debug('[Auth] checkAuth start');
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      console.debug('[Auth] token in storage:', !!token, 'storedUser:', !!storedUser);
      if (token && storedUser) {
        try {
          await authAPI.verifyToken();
          setUser(JSON.parse(storedUser));
          console.debug('[Auth] verifyToken succeeded, user restored from storage');
        } catch (err) {
          console.warn('[Auth] verifyToken failed:', err?.response?.status, err?.response?.data?.message || err?.message);
          const status = err?.response?.status;
          // If token is invalid/expired, attempt refresh — prefer cookie refresh when available.
          if (status === 401 || status === 403) {
            // First, check local flag. If missing, probe once (handles timing where Set-Cookie
            // was just issued but client hasn't recorded the flag yet).
            let hasRefreshCookie = localStorage.getItem('hasRefreshCookie') === '1';
            if (!hasRefreshCookie) {
              try {
                const probeOk = await probeRefreshCookie();
                hasRefreshCookie = !!probeOk;
              } catch (probeErr) {
                console.debug('[Auth] refresh-cookie probe error', probeErr?.message || probeErr);
              }
            }

            if (!hasRefreshCookie) {
              console.debug('[Auth] no refresh cookie available — clearing local session');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            } else {
              // if the last login was very recent, skip calling /refresh to avoid
              // a race where the browser hasn't yet persisted the cookie
              const lastLogin = Number(localStorage.getItem('lastLoginAt') || 0);
              const justLoggedIn = lastLogin && Date.now() - lastLogin < 5000;
              if (justLoggedIn) {
                console.debug('[Auth] skipping refresh because user just logged in');
              } else {
                try {
                  const refreshRes = await authAPI.refresh();
                  const token = refreshRes.data?.data?.token;
                  const newUser = refreshRes.data?.data?.user || null;
                  if (token) {
                    localStorage.setItem('token', token);
                  }
                  if (newUser) {
                    localStorage.setItem('user', JSON.stringify(newUser));
                    setUser(newUser);
                  }
                  console.debug('[Auth] refresh succeeded, session restored');
                } catch (e) {
                  const refreshStatus = e?.response?.status;
                  console.warn('[Auth] refresh failed:', refreshStatus, e?.response?.data?.message || e?.message);
                  // Remove refresh-cookie flag on explicit 401/403 to avoid retries
                  if (refreshStatus === 401 || refreshStatus === 403) {
                    localStorage.removeItem('hasRefreshCookie');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                  } else {
                    // Transient error (429/network) — keep stored user so UI doesn't loop
                    try {
                      setUser(JSON.parse(storedUser));
                    } catch (parseErr) {
                      // fallback remove on parse failure
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      setUser(null);
                    }
                  }
                }
              }
            }
          } else {
            // Transient error (rate limit / network) — keep stored user so UI remains stable
            try {
              setUser(JSON.parse(storedUser));
            } catch (parseErr) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          }
        }
      } else {
        // No token in storage: attempt refresh (cookie-based) to restore session
        const hasRefreshCookie = localStorage.getItem('hasRefreshCookie') === '1';
        if (!hasRefreshCookie) {
          console.debug('[Auth] skipping cookie refresh (no local refresh-cookie flag)');
          // ensure user is unauthenticated
          setUser(null);
        } else {
          try {
            const refreshRes = await authAPI.refresh();
            const token = refreshRes.data?.data?.token;
            const newUser = refreshRes.data?.data?.user || null;
            if (token) {
              localStorage.setItem('token', token);
              try { localStorage.setItem('lastLoginAt', String(Date.now())); } catch (e) {}
            }
            if (newUser) {
              localStorage.setItem('user', JSON.stringify(newUser));
              try { localStorage.setItem('lastLoginAt', String(Date.now())); } catch (e) {}
              setUser(newUser);
            }
            console.debug('[Auth] refresh via cookie restored session');
          } catch (err) {
            const status = err?.response?.status;
            console.warn('[Auth] cookie refresh failed:', status, err);
            // Remove local refresh-cookie flag when server explicitly reports no/invalid refresh token
            if (status === 401 || status === 403) {
              localStorage.removeItem('hasRefreshCookie');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
            // otherwise leave unauthenticated
          }
        }
      }
      setLoading(false);
      console.debug('[Auth] checkAuth finished, loading=false');
    };

    checkAuth();
  }, []);

  // Listen for external logout events (e.g. API interceptor) and clear auth state + navigate to login
  useEffect(() => {
    const handler = (ev) => {
      console.debug('[Auth] ai_re_logout event received', ev?.detail || null, new Date().toISOString());
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {}
      setUser(null);
      setError(null);
      setLoading(false);
      // ensure a single-place navigation to the auth page to avoid loops
      try {
        if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
          window.location.replace('/auth?mode=login');
        }
      } catch (e) {
        /* ignore */
      }
    };
    window.addEventListener('ai_re_logout', handler);
    return () => window.removeEventListener('ai_re_logout', handler);
  }, []);

  // Monitor session integrity and detect tampering — periodic server /me validation
  useEffect(() => {
    if (!user) return undefined;
    let mounted = true;

    const validate = async () => {
      // avoid running validation immediately after a fresh login since the
      // browser may not have saved the refresh cookie yet; the login logic
      // already set user/token so validation is redundant and can produce a
      // misleading 401 which causes a follow‑on refresh failure.
      const lastLogin = Number(localStorage.getItem('lastLoginAt') || 0);
      if (lastLogin && Date.now() - lastLogin < 5000) {
        console.debug('[Auth] skipping validateUserSession due to recent login');
        return;
      }

      try {
        const res = await validateUserSession();
        if (!mounted) return;

        if (!res.isValid) {
          // server indicates session invalid or token expired -> clear client state
          try { clearLocalSession(); } catch (e) {}
          setUser(null);
          setError(null);
          setLoading(false);
          try { window.dispatchEvent(new Event('ai_re_logout')); } catch (e) {}
          return;
        }

        const serverUser = res.user;
        if (serverUser) {
          if (isRoleTampered(serverUser)) {
            console.warn('[Auth] role tampering detected — clearing session');
            try { clearLocalSession(); } catch (e) {}
            setUser(null);
            try { window.dispatchEvent(new Event('ai_re_logout')); } catch (e) {}
            return;
          }

          try {
            const stored = getStoredUser();
            if (!stored || JSON.stringify(stored) !== JSON.stringify(serverUser)) {
              storeUser(serverUser);
              setUser(serverUser);
            }
          } catch (e) { /* ignore */ }
        }
      } catch (e) {
        console.debug('[Auth] periodic session validation failed:', e?.message || e);
      }
    };

    validate();
    const id = setInterval(validate, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [user]);

  // Helper: unified admin check to avoid duplicated role-detection logic elsewhere
  const isAdmin = useMemo(() => {
    if (!user) return false;
    if (Array.isArray(user.roles)) {
      if (user.roles.includes('admin')) return true;
      // allow numeric role ids too
      if (user.roles.includes(1) || user.roles.includes(9)) return true;
    }
    if (typeof user.role === 'string') {
      if (user.role.toLowerCase() === 'admin') return true;
    }
    if (user.role_id !== undefined) {
      const id = Number(user.role_id);
      if (id === 1 || id === 9) return true;
    }
    return false;
  }, [user]);

  /* probeRefreshCookie is defined above (single shared implementation) */


  const login = async (email, password, remember = false) => {
    console.debug('[Auth] login called with', { email, remember });
    try {
      setError(null);
      // mark that an auth flow is in progress so global interceptors
      // can avoid treating transient 401s as a full logout
      try { localStorage.setItem('authInProgress', '1'); } catch (e) {}
      setLoading(true);

      // Use axios-based helpers so baseURL and withCredentials are consistent
      let resData = {};
      try {
        const loginRes = await authAPI.login(email, password, remember);
        resData = loginRes?.data || {};
      } catch (err) {
        // axios throws on non-2xx; normalize the server response so the caller
        // can render field errors instead of surfacing a generic global alert.
        const resp = err?.response?.data || null;
        const message = resp?.message || err?.message || 'Login failed. Please try again.';
        const fieldErrors = resp?.errors || null;
        return { success: false, error: message, errors: fieldErrors };
      }

      console.debug('[Auth] login response', resData);

      // Support multiple server shapes: token may live in several places
      let token = resData.token || resData.data?.token || resData.accessToken || resData.access_token || null;

      if (token) {
        try { localStorage.setItem('token', token); } catch (e) {}
        try { localStorage.setItem('lastLoginAt', String(Date.now())); } catch (e) {}
        console.debug('[Auth] persisted token', String(token).slice(0, 12) + '...');
      } else {
        console.debug('[Auth] no token in response (cookie-only session)');
      }

      // Fetch authoritative user via axios helper
      try {
        const meRes = await authAPI.getMe();
        const fetched = meRes?.data?.data || meRes?.data || null;
        if (fetched) {
          const normalizedUser = {
            ...fetched,
            roles: Array.isArray(fetched.roles)
              ? fetched.roles.map(r => (typeof r === 'string' ? r.toLowerCase() : String(r)))
              : fetched.roles ? [String(fetched.roles).toLowerCase()] : [],
          };
          try { localStorage.setItem('user', JSON.stringify(normalizedUser)); } catch (e) {}
          try { localStorage.setItem('lastLoginAt', String(Date.now())); } catch (e) {}
          setUser(normalizedUser);
          if (localStorage.getItem('hasRefreshCookie') !== '1') {
            setTimeout(() => probeRefreshCookie().catch(() => {}), 500);
          }
          console.debug('[Auth] /me returned user', { roles: normalizedUser.roles });
          return { success: true, user: normalizedUser };
        }
      } catch (meErr) {
        // If /me fails with 401/403, surface a friendly error rather than a
        // generic axios message. Let the outer catch handle unexpected errors.
        const resp = meErr?.response?.data || null;
        if (resp) {
          const message = resp.message || 'Failed to fetch user profile';
          const fieldErrors = resp.errors || null;
          return { success: false, error: message, errors: fieldErrors };
        }
        console.warn('[Auth] /me request failed', meErr?.message || meErr);
      }

      // ── Step 3: Fallback — use user object from login response ────────────
      const respUser = resData.user || resData.data?.user || null;
      if (respUser) {
        const normalizedUser = {
          ...respUser,
          roles: Array.isArray(respUser.roles)
            ? respUser.roles.map(r => (typeof r === 'string' ? r.toLowerCase() : String(r)))
            : respUser.roles ? [String(respUser.roles).toLowerCase()] : [],
        };
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('lastLoginAt', String(Date.now()));
        setUser(normalizedUser);
        if (localStorage.getItem('hasRefreshCookie') !== '1') {
          setTimeout(() => probeRefreshCookie().catch(() => {}), 500);
        }
        console.debug('[Auth] login stored user from response', { roles: normalizedUser.roles });
        return { success: true, user: normalizedUser };
      }

      console.debug('[Auth] login succeeded but no user returned');
      // treat this as a failure so UI can display an error instead of staying on the form
      const msg = 'Login succeeded but server did not return user information';
      setError(msg);
      return { success: false, error: msg };

    } catch (err) {
      const message = err?.message || 'Login failed. Please try again.';
      // network or unexpected error - update global error so UI can show alert if desired
      setError(message);
      return { success: false, error: message, errors: null };
    } finally {
      setLoading(false);
      try { localStorage.removeItem('authInProgress'); } catch (e) {}
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // ignore - still clear client state
      console.warn('Logout API failed', err?.message || err);
    } finally {
      try { localStorage.removeItem('token'); } catch (e) {}
      try { localStorage.removeItem('user'); } catch (e) {}
      try { localStorage.removeItem('lastLoginAt'); } catch (e) {}
      try { localStorage.removeItem('hasRefreshCookie'); } catch (e) {}
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,           // expose for components like LoginForm
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin,
    login,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;