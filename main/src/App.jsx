import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider, useAuth } from './context/AuthContext';

import HomePage from './pages/public/HomePage';
import PropertyListings from './pages/public/PropertyListings';
import PropertyDetails from './pages/public/PropertyDetails';

import AuthPage from './pages/auth/AuthPage';
import AdminApp from './admin/AdminApp';
import PublicLayout from './layouts/PublicLayout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0d9488',
      light: '#14b8a6',
      dark: '#0f766e',
    },
    secondary: {
      main: '#0a1628',
      light: '#142140',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

function HomeIndex() {
  // Keep the public home page as the default landing page for everyone.
  // Admins can still access /admin/*, but they won't be auto-redirected away from /.
  return <HomePage />;
}

function AuthRedirect({ children }) {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const location = useLocation();

  // While auth state is resolving, avoid flickering routes.
  if (loading) return null;

  // If already logged in, don't let the user stay on /auth, /login, /register.
  if (isAuthenticated) {
    if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

function AdminGuard({ children }) {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // only admins can enter /admin/*.
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/auth"
              element={
                <AuthRedirect>
                  <AuthPage />
                </AuthRedirect>
              }
            />
            <Route
              path="/login"
              element={
                <AuthRedirect>
                  <AuthPage />
                </AuthRedirect>
              }
            />
            <Route
              path="/register"
              element={
                <AuthRedirect>
                  <AuthPage />
                </AuthRedirect>
              }
            />

            {/* Admin panel route (entire admin layout protected) */}
            <Route
              path="/admin/*"
              element={
                // Guard admin routes here so we don't bounce back to login while
                // the auth state is still resolving ("loading" phase).
                <AdminGuard>
                  <AdminApp />
                </AdminGuard>
              }
            />

            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomeIndex />} />
              <Route path="properties" element={<PropertyListings />} />
              <Route path="properties/:id" element={<PropertyDetails />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;