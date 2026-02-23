import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Properties': [
      { label: 'Browse All', path: '/properties' },
      { label: 'New Listings', path: '/properties?sort=newest' },
      { label: 'Open Homes', path: '/properties?filter=open-homes' },
      { label: 'Price Reduced', path: '/properties?filter=price-reduced' },
    ],
    'Sellers': [
      { label: 'List Your Property', path: '/sell' },
      { label: 'Seller Dashboard', path: '/dashboard' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'How It Works', path: '/how-it-works' },
    ],
    'Company': [
      { label: 'About Oakford Realty', path: '/about' },
      { label: 'Our Technology', path: '/technology' },
      { label: 'Careers', path: '/careers' },
      { label: 'Contact Us', path: '/contact' },
    ],
    'Legal': [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Policy', path: '/cookies' },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0a1628',
        color: 'white',
        pt: 8,
        pb: 4,
        p: 2.5
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3, mt: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                  <Box sx={{ display: 'flex', gap: 0.3 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#14b8a6' }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#14b8a6' }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.3 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#14b8a6' }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'transparent', border: '2px solid #14b8a6' }} />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  Ai-re
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, maxWidth: 300 }}>
                Australia's first AI-powered real estate platform. Smarter selling, transparent buying.
              </Typography>
              
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 18, color: '#14b8a6' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    hello@oakfordrealty.com.au
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 18, color: '#14b8a6' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    1300 OAKFORD
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 18, color: '#14b8a6' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Sydney, Australia
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>

          {Object.entries(footerLinks).map(([title, links]) => (
            <Grid item xs={6} sm={3} md={2} key={title}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ mb: 2, color: '#14b8a6' }}
              >
                {title}
              </Typography>
              <Stack spacing={1}>
                {links.map((link) => (
                  <Typography
                    key={link.label}
                    component={Link}
                    to={link.path}
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      '&:hover': { color: '#14b8a6' },
                    }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            © {currentYear} Oakford Realty. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {[Facebook, Twitter, Instagram, LinkedIn].map((Icon, index) => (
              <IconButton
                key={index}
                size="small"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    color: '#14b8a6',
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                  },
                }}
              >
                <Icon fontSize="small" />
              </IconButton>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
