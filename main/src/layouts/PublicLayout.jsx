import { Outlet } from 'react-router-dom';
import Navbar from '../components/public/Navbar';
import Footer from '../components/public/Footer';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

const PublicLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden', width: '100%' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* toolbar spacer ensures content sits below the fixed AppBar */}
        <Toolbar />
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default PublicLayout;
