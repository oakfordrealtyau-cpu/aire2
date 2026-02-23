import axios from 'axios';

// Use Vite env `VITE_API_URL` when provided. During development we
// proxy `/api` to the backend (see `vite.config.js`), so the default
// base URL should be relative. That keeps the browser and server on the
// same origin and allows refresh cookies to be treated as first-party.
// In production the env variable will be set to the real API host.
// During local development always use the relative path so the Vite
// proxy handles the request; this ensures cookies are treated as
// first‑party and will be stored/sent correctly.  In production the
// build can supply a fully qualified URL via VITE_API_URL.
const API_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: "https://ai-re-server.vercel.app/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.name === 'CanceledError' ||
      error?.code === 'ERR_CANCELED' ||
      axios.isCancel(error)
    ) {
      // swallowed cancelled requests — keep the Promise pending
      return new Promise(() => {});
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password, remember) => api.post('/auth/login', { email, password, remember }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyToken: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  registerInit: (data) => api.post('/auth/register-init', data),
  verifyCode: (email, code) => api.post('/auth/verify', { email, code }),
  resendCode: (email) => api.post('/auth/resend-code', { email }),
  checkAvailability: (data) => api.post('/auth/check-availability', data),
};

export default api;
