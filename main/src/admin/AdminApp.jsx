import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Drawer, Box, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
// ...import other admin pages/components...

const AdminApp = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobileSidebar = () => setMobileOpen((s) => !s);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0a1628' }}>
      {/* Permanent sidebar on desktop, drawer on mobile */}
      {!isMobile && <Sidebar />}
      {isMobile && (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          anchor="left"
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: 280, bgcolor: 'secondary.light', color: 'common.white' } }}
        >
          <Sidebar forceExpanded />
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar onMenuClick={toggleMobileSidebar} />
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            {/* ...other admin routes (use relative paths) ... */}
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminApp;
