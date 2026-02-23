import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
  Container,
  Fade,
  Grid,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Home,
  TrendingUp,
  Security,
  ArrowBack,
} from '@mui/icons-material';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { isAuthenticated, loading: authLoading, isAdmin, error, setError } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  useEffect(() => {
    // Debugging: Log auth state changes
    console.debug('[AuthPage] useEffect triggered', {
      authLoading,
      isAuthenticated,
      isAdmin,
    });

    // redirect away from auth pages when already logged in
    if (!authLoading && isAuthenticated) {
      // show a short success message when login just happened (lastLoginAt set by AuthContext)
      const lastLogin = Number(localStorage.getItem('lastLoginAt') || 0);
      const justLoggedIn = lastLogin && Date.now() - lastLogin < 5000;

      if (justLoggedIn) {
        setShowSuccess(true);
        const t = setTimeout(() => {
          setShowSuccess(false);
          if (isAdmin) navigate('/admin/dashboard', { replace: true });
          else navigate('/', { replace: true });
        }, 1200);
        return () => clearTimeout(t);
      }

      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);
  
  // Initialize tab value from URL
  const [tabValue, setTabValue] = useState(() => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    return mode === 'register' ? 1 : 0;
  });

  // Sync tab with URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    console.log('[AuthPage] URL changed to mode:', mode);
    const newTab = mode === 'register' ? 1 : 0;
    setTabValue(newTab);
  }, [location.search]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (setError) setError(null);
    const newMode = newValue === 1 ? 'register' : 'login';
    navigate(`/auth?mode=${newMode}`, { replace: true });
  };

  const switchToRegister = () => {
    setTabValue(1);
    if (setError) setError(null);
    navigate('/auth?mode=register', { replace: true });
  };

  const switchToLogin = () => {
    setTabValue(0);
    if (setError) setError(null);
    navigate('/auth?mode=login', { replace: true });
  };

  const handleRegistrationSuccess = (email, password) => {
    setRegistrationData({ email, password });
    switchToLogin();
  };

  const features = [
    {
      icon: <Home sx={{ fontSize: 32, color: 'white' }} />,
      title: 'Find Your Dream Home',
      description: 'Browse through thousands of verified properties.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 32, color: 'white' }} />,
      title: 'Smart Market Insights',
      description: 'Get real-time market analysis and predictions.',
    },
    {
      icon: <Security sx={{ fontSize: 32, color: 'white' }} />,
      title: 'Secure Transactions',
      description: 'End-to-end encrypted property records.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[200]} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={24}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            borderRadius: 4,
            overflow: 'hidden',
            minHeight: { md: 600 },
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          }}
        >
          {/* Left Side - Features Panel */}
          <Box
            sx={{
              width: { xs: '100%', md: '40%' },
              background: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`, // Dark gradient
              color: 'white',
              p: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Logo area */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
               <Box 
                 sx={{ 
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   flexDirection: 'column',
                   cursor: 'pointer',
                   transition: 'transform 0.2s',
                   '&:hover': { transform: 'scale(1.05)' }
                 }}
                 onClick={() => navigate('/')}
               >
                 <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                     <Box sx={{ display: 'flex', gap: 0.5 }}>
                       <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#14b8a6' }} />
                       <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#14b8a6' }} />
                     </Box>
                     <Box sx={{ display: 'flex', gap: 0.5 }}>
                       <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#14b8a6' }} />
                       <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'transparent', border: '2px solid #14b8a6' }} />
                     </Box>
                   </Box>
                 </Box>
                 
               </Box>
            </Box>

            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{
                position: 'absolute',
                top: 24,
                left: 24,
                color: 'white',
                opacity: 0.7,
                '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.1)' },
                display: { xs: 'none', md: 'flex' }
              }}
            >
              Home
            </Button>

            <Typography variant="h4" fontWeight={700} sx={{ mb: 1, textAlign: 'center', letterSpacing: '-0.5px' }}>
              Ai-re
            </Typography>
            <Typography variant="body1" sx={{ mb: 5, textAlign: 'center', opacity: 0.8 }}>
              The future of intelligent real estate trading.
            </Typography>

            {/* Features List */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  <Box sx={{ mr: 2 }}>{feature.icon}</Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 'auto', textAlign: 'center', opacity: 0.5, fontSize: '0.75rem' }}>
              © 2026 AI-RE.
            </Box>
          </Box>

          {/* Right Side - Auth Forms */}
          <Box
            sx={{
              width: { xs: '100%', md: '60%' },
              bgcolor: 'background.paper',
              p: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
              // Allow scroll on right side if content is too tall
              overflowY: 'auto',
              maxHeight: { xs: 'none', md: '90vh' },
              position: 'relative',
            }}
          >
            {/* Mobile Back Button */}
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                display: { xs: 'flex', md: 'none' },
                color: 'text.secondary',
              }}
            >
              <ArrowBack />
            </IconButton>

            <Box sx={{ maxWidth: 480, width: '100%', mx: 'auto' }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1, textAlign: 'center', color: 'text.primary' }}>
                {tabValue === 0 ? 'Welcome Back' : 'Get Started'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                {tabValue === 0 ? 'Sign in to access your dashboard' : 'Create your account in seconds'}
              </Typography>



              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              {tabValue === 0 ? (
                <LoginForm
                  key="login-form"
                  onSwitchToRegister={switchToRegister}
                  registrationData={registrationData}
                  onLoginSuccess={(user) => {
                    // role detection must mirror AuthContext.isAdmin logic
                    const isAdminUser =
                      user?.roles?.includes('admin') ||
                      user?.role === 'admin' ||
                      Number(user?.role_id) === 1 ||
                      Number(user?.role_id) === 9;
                    if (isAdminUser) {
                      navigate('/admin/dashboard', { replace: true });
                    } else {
                      navigate('/', { replace: true });
                    }
                  }}
                />
              ) : (
                <RegisterForm onSwitchToLogin={switchToLogin} onRegistrationSuccess={handleRegistrationSuccess} />
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
      <Snackbar open={showSuccess} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={() => setShowSuccess(false)} autoHideDuration={2000}>
        <Alert severity="success" sx={{ width: '100%' }} onClose={() => setShowSuccess(false)}>
          Signed in successfully — redirecting...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuthPage;



