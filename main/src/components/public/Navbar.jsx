import React, { useState, useMemo } from 'react';
import { 
  BrowserRouter, 
  Link, 
  useNavigate, 
  useLocation,
  Routes,
  Route 
} from 'react-router-dom';
import { useAuth, AuthProvider } from '../../context/AuthContext';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useScrollTrigger,
  Slide,
  alpha,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Close, 
  Home, 
  Search, 
  Sell, 
  Login, 
  PersonAdd, 
  Logout, 
  Dashboard, 
  AccountCircle 
} from '@mui/icons-material';



/**
 * COMPONENT: HideOnScroll
 */
function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const navItems = [
  { label: 'Home', path: '/', icon: <Home /> },
  { label: 'Buy', path: '/properties', icon: <Search /> },
  { label: 'Sell', path: '/sell', icon: <Sell /> },
];

/**
 * COMPONENT: Navbar
 */
const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout, login } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box 
      sx={{ 
        width: 280, 
        height: '100%', 
        bgcolor: 'rgba(10, 22, 40, 0.98)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        color: 'white'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
            <Box sx={{ display: 'flex', gap: 0.3 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: '#14b8a6' }} />
              <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: '#14b8a6' }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 0.3 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: '#14b8a6' }} />
              <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: 'transparent', border: '1.5px solid #14b8a6' }} />
            </Box>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
            Ai-re
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <List sx={{ px: 2, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: '12px',
                py: 1.5,
                color: isActive(item.path) ? '#14b8a6' : 'rgba(255,255,255,0.7)',
                bgcolor: isActive(item.path) ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                transition: 'all 0.2s ease',
              }}
            >
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', color: isActive(item.path) ? '#14b8a6' : 'inherit' }}>
                {item.icon}
              </Box>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: isActive(item.path) ? 700 : 500 }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {!isAuthenticated ? (
          <>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Login />}
              sx={{
                mb: 2,
                py: 1.5,
                borderRadius: '14px',
                color: 'white',
                borderColor: 'rgba(255,255,255,0.2)',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { borderColor: '#14b8a6', bgcolor: 'rgba(20, 184, 166, 0.05)' },
              }}
              onClick={() => {
                handleDrawerToggle();
                navigate('/auth?mode=login');
              }}
            >
              Log In
            </Button>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PersonAdd />}
              sx={{
                py: 1.5,
                borderRadius: '14px',
                bgcolor: '#14b8a6',
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: '0 8px 20px -6px rgba(20, 184, 166, 0.5)',
                '&:hover': { bgcolor: '#0d9488', transform: 'translateY(-1px)' },
              }}
              onClick={() => {
                handleDrawerToggle();
                navigate('/auth?mode=register');
              }}
            >
              Sign Up
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button 
              fullWidth 
              variant="text" 
              startIcon={isAdmin ? <Dashboard /> : <AccountCircle />}
              sx={{ 
                py: 1.5,
                borderRadius: '14px',
                color: 'white', 
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: 'rgba(255,255,255,0.03)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
              }} 
              onClick={() => { 
                handleDrawerToggle(); 
                isAdmin ? navigate('/admin/dashboard') : navigate('/profile'); 
              }}
            >
              {isAdmin ? 'Dashboard' : 'My Account'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Logout />}
              sx={{ 
                py: 1.5,
                borderRadius: '14px',
                color: '#ff5f5f', 
                borderColor: 'rgba(255, 95, 95, 0.2)',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { borderColor: '#ff5f5f', bgcolor: 'rgba(255, 95, 95, 0.05)' }
              }}
              onClick={handleLogout}
            >
              Log out
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <HideOnScroll>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: alpha('#0a1628', 0.75),
            backdropFilter: 'blur(16px) saturate(180%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ py: 1.5 }}>
              {/* Brand Logo */}
              <Box
                component={Link}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  mr: 6,
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 0.8 }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                    <Box sx={{ display: 'flex', gap: 0.4 }}>
                      <Box sx={{ width: 9, height: 9, borderRadius: '2px', bgcolor: '#14b8a6' }} />
                      <Box sx={{ width: 9, height: 9, borderRadius: '2px', bgcolor: '#14b8a6' }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.4 }}>
                      <Box sx={{ width: 9, height: 9, borderRadius: '2px', bgcolor: '#14b8a6' }} />
                      <Box sx={{ width: 9, height: 9, borderRadius: '2px', bgcolor: 'transparent', border: '1.8px solid #14b8a6' }} />
                    </Box>
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 900,
                      color: 'white',
                      letterSpacing: '-1.2px',
                      fontSize: { xs: '1.4rem', md: '1.6rem' }
                    }}
                  >
                    Ai-re
                  </Typography>
                </Box>
              </Box>

              {/* Desktop Nav Items */}
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1.5 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: isActive(item.path) ? '#14b8a6' : 'rgba(255,255,255,0.65)',
                      fontWeight: isActive(item.path) ? 700 : 500,
                      fontSize: '0.92rem',
                      px: 2.5,
                      py: 1,
                      borderRadius: '10px',
                      textTransform: 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.06)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>

              {/* Desktop Actions */}
              {!isAuthenticated ? (
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5 }}>
                  <Button
                    variant="text"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 3,
                      borderRadius: '10px',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: 'white' },
                    }}
                    onClick={() =>   {  
                navigate('/auth?mode=login');}
                    }
                  >
                    Log In
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: '#14b8a6',
                      color: 'white',
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 3.5,
                      py: 1.2,
                      borderRadius: '12px',
                      boxShadow: '0 8px 16px -4px rgba(20, 184, 166, 0.3)',
                      '&:hover': { 
                        bgcolor: '#0d9488',
                        boxShadow: '0 12px 24px -6px rgba(20, 184, 166, 0.45)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => navigate('/auth?mode=register')}
                  >
                    Sign Up
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5, alignItems: 'center' }}>
                  <Button 
                    variant="text" 
                    onClick={() => isAdmin ? navigate('/admin/dashboard') : navigate('/profile')}
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2.5,
                      borderRadius: '10px',
                      bgcolor: 'rgba(255, 255, 255, 0.04)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' }
                    }}
                  >
                    {isAdmin ? 'Dashboard' : 'My Account'}
                  </Button>
                  <IconButton
                    onClick={handleLogout}
                    sx={{
                      color: 'rgba(255,255,255,0.5)',
                      bgcolor: 'rgba(255,255,255,0.04)',
                      '&:hover': { 
                        color: '#ff5f5f', 
                        bgcolor: 'rgba(255, 95, 95, 0.1)',
                        transform: 'scale(1.05)' 
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Logout fontSize="small" />
                  </IconButton>
                </Box>
              )}

              {/* Mobile Burger Menu Icon */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}>
                <IconButton
                  onClick={handleDrawerToggle}
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    p: 1.2,
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&:active': { transform: 'scale(0.95)' }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Responsive Glass Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            bgcolor: 'transparent',
            boxShadow: '-20px 0 50px rgba(0,0,0,0.6)',
            borderLeft: '1px solid rgba(255,255,255,0.1)'
          },
        }}
      >
        {drawer}
      </Drawer>

      <Toolbar sx={{ mb: 2 }} />
    </>
  );
};

/**
 * ENTRY POINT: App
 * Wraps everything in necessary providers for standalone execution.
 */
const App = () => {
  const darkTheme = useMemo(() => createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#14b8a6' },
      background: { default: '#0a1628' },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    }
  }), []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Box sx={{ minHeight: '100vh', bgcolor: '#0a1628', color: 'white' }}>
            <Navbar />
            <Container sx={{ mt: 10 }}>
              <Routes>
                <Route path="/" element={<WelcomeView />} />
                <Route path="*" element={<WelcomeView />} />
              </Routes>
            </Container>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

const WelcomeView = () => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
      Welcome to Ai-re
    </Typography>
    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4 }}>
      Experience the future of real estate with our glass-modern interface.
    </Typography>
    <Box sx={{ 
      p: 4, 
      borderRadius: 4, 
      bgcolor: 'rgba(255,255,255,0.03)', 
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <Typography>Try toggling the mobile view or scrolling down to see the Navbar behavior!</Typography>
    </Box>
  </Box>
);

// Export Navbar component for app usage; keep demo App as a named export for isolated preview
export { App as NavbarDemo };
export default Navbar;