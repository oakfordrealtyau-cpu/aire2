import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import PeopleOutline from '@mui/icons-material/PeopleOutline';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import LocalOfferOutlined from '@mui/icons-material/LocalOfferOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardOutlined /> },
  { label: 'Users', path: '/admin/users', icon: <PeopleOutline /> },
  { label: 'Listings', path: '/admin/listings', icon: <HomeOutlined /> },
  { label: 'Offers', path: '/admin/offers', icon: <LocalOfferOutlined /> },
  { label: 'Docs', path: '/admin/docs', icon: <DescriptionOutlined /> },
  { label: 'Reports', path: '/admin/reports', icon: <BarChartOutlined /> },
  { label: 'Audit', path: '/admin/audit', icon: <HistoryOutlined /> },
];

const Sidebar = ({ forceExpanded = false }) => {
  const { pathname } = useLocation();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const collapsed = isSmall && !forceExpanded;

  return (
    <Box
      component="aside"
      sx={{
        width: collapsed ? 72 : 220,
        minWidth: collapsed ? 72 : 220,
        bgcolor: 'secondary.light',
        color: 'common.white',
        display: 'flex',
        flexDirection: 'column',
        pt: 3,
        pb: 3,
        px: 1,
        boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
        borderRight: '1px solid rgba(255,255,255,0.02)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: collapsed ? 0 : 2, mb: 3 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'transparent', border: '2px solid #14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center', ml: collapsed ? 1 : 0 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#14b8a6' }} />
        </Box>
        {!collapsed && (
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            AI-RE Hub
          </Typography>
        )}
      </Box>

      <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {navItems.map((item) => {
          const selected = pathname === item.path;
          const itemSx = {
            color: selected ? '#14b8a6' : 'rgba(255,255,255,0.9)',
            background: selected ? 'rgba(20,184,166,0.04)' : 'transparent',
            borderLeft: selected ? '4px solid #14b8a6' : '4px solid transparent',
            borderRadius: '0 14px 14px 0',
            px: collapsed ? 0.5 : 2,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            textDecoration: 'none',
            fontWeight: 600,
          };

          const iconSx = {
            color: 'inherit',
            minWidth: 36,
            display: 'flex',
            justifyContent: 'center',
          };

          return (
            <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right" arrow>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={itemSx}
              >
                <ListItemIcon sx={iconSx}>{
                  /* small outlined icon (no filled background) */
                  React.cloneElement(item.icon, { fontSize: 'small' })
                }</ListItemIcon>

                {!collapsed && <ListItemText primary={item.label} sx={{ '& .MuiListItemText-primary': { fontSize: '0.95rem', color: 'inherit' } }} />}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Box sx={{ flex: 1 }} />

      <Box sx={{ px: collapsed ? 0.5 : 2 }}>
        <ListItemButton sx={{ px: collapsed ? 0.5 : 2, py: 1, borderRadius: '8px' }}>
          <ListItemIcon sx={{ minWidth: 36, color: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'center' }}>
            {/* small user dot */}
            <Box sx={{ width: 8, height: 8, bgcolor: '#14b8a6', borderRadius: '50%' }} />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Admin User" secondary="admin" sx={{ color: 'rgba(255,255,255,0.8)' }} />}
        </ListItemButton>
      </Box>
    </Box>
  );
};

export default Sidebar;
