import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, IconButton, Typography, useTheme, useMediaQuery, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const menuRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDoc);

    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);

    // initial state
    setIsFullscreen(!!document.fullscreenElement);

    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  }, []);

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      // state will update via fullscreenchange listener
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Fullscreen toggle failed', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (err) {
      console.warn('Logout failed', err);
    } finally {
      navigate('/login');
      window.location.reload();
    }
  };

  const initials = user?.firstName ? (user.firstName[0] || 'A') : 'A';

  return (
    <Box component="header" sx={{
      height: 64,
      background: 'rgba(255,255,255,0.75)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 1100,
      justifyContent: 'space-between',
      px: { xs: 2, md: 4 },
      boxShadow: '0 6px 30px rgba(2,6,23,0.08)',
      backdropFilter: 'saturate(140%) blur(8px)',
      borderBottom: '1px solid rgba(16,24,40,0.06)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {isMobile && onMenuClick && (
          <IconButton onClick={onMenuClick} size="large" sx={{ color: '#0a1628' }} aria-label="open menu">
            <MenuIcon />
          </IconButton>
        )}
        <Typography sx={{ fontWeight: 700, fontSize: 20, color: '#0a1628' }}>AI-RE Admin</Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }} ref={menuRef}>
        <Tooltip title={isFullscreen ? 'Exit full screen' : 'Enter full screen'}>
          <IconButton onClick={toggleFullScreen} size="small" sx={{ color: '#64748b' }} aria-label="toggle fullscreen">
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>

        <Box sx={{ textAlign: 'right', mr: 1, display: { xs: 'none', sm: 'block' } }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Admin'}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{user?.roles?.join(', ') || 'admin'}</div>
        </Box>

        <button
          onClick={() => setOpen(s => !s)}
          aria-haspopup="true"
          aria-expanded={open}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#14b8a6',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {initials}
        </button>

        {open && (
          <div style={{ position: 'absolute', right: 8, top: 64 + 8, zIndex: 1400 }}>
            <div style={{ width: 220, background: 'white', borderRadius: 12, boxShadow: '0 10px 30px rgba(2,6,23,0.12)', overflow: 'hidden' }}>
              <button onClick={() => { navigate('/profile'); setOpen(false); }} style={{ width: '100%', padding: 12, textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer' }}>Profile</button>
              <div style={{ height: 1, background: '#f1f5f9' }} />
              <button onClick={handleSignOut} style={{ width: '100%', padding: 12, textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontWeight: 700 }}>Sign out</button>
            </div>
          </div>
        )}
      </Box>
    </Box>
  );
};

export default Topbar;
