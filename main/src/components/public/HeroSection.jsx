import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Paper,
  Chip,
} from '@mui/material';
import { Search, LocationOn, TrendingUp, Home, Sell } from '@mui/icons-material';

const popularSuburbs = [
  'Sydney CBD',
  'Melbourne',
  'Brisbane',
  'Perth',
  'Gold Coast',
  'Parramatta',
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box
      sx={{
        // Responsive hero: small top padding on mobile, vertically centered on desktop
        pt: { xs: 25, md: 20 },
        pb: 6,
        px: 3,
        mt: -20,
        position: 'relative',
        minHeight: { xs: 'auto', md: '85vh' },
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: { xs: 'flex-start', md: 'center' },
        bgcolor: '#0a1628',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: `
            radial-gradient(circle at 20% 50%, #14b8a6 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, #14b8a6 0%, transparent 50%)
          `,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(#14b8a6 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.1,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, md: 0 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 4, md: 6 }, alignItems: 'flex-start' }}>
          <Box sx={{ width: '100%', flex: '1 1 58%', minWidth: 0, maxWidth: { md: '58%' } }}>

            <Typography
              variant="h1"
              sx={{
                color: 'white',
                fontWeight: 800,
                fontSize: { xs: '2.5rem', sm: '3.0rem', md: '4.0rem', lg: '4.3rem' },
                lineHeight: 1.08,
                mb: 3.5,
                letterSpacing: '-1.5px',
              }}
            >
              Find Your{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: 'inherit',
                  fontWeight: 900,
                }}
              >
                Perfect Home
              </Box>
              <br />
              with AI
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 400,
                mb: 4,
                maxWidth: 500,
                lineHeight: 1.6,
              }}
            >
              Smart property search, AI-powered valuations, and transparent buying. 
              Experience real estate reimagined.
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                maxWidth: { xs: '100%', md: 600 },
                width: '100%',
                borderRadius: 3,
                bgcolor: 'white',
                mb: 3,
              }}
            >
              <TextField
                fullWidth
                placeholder="Search suburbs, postcodes, or addresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: '#14b8a6', ml: 1 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ px: 1 }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleSearch}
                sx={{
                  px: { xs: 2, sm: 4 },
                  py: 1.2,
                  bgcolor: '#14b8a6',
                  '&:hover': { bgcolor: '#0d9488' },
                  borderRadius: 2,
                  minWidth: { xs: 72, sm: 'auto' },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                }}
                startIcon={<Search />}
              >
                Search
              </Button>
            </Paper>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }}>
                Popular:
              </Typography>
              {popularSuburbs.map((suburb) => (
                <Chip
                  key={suburb}
                  label={suburb}
                  size="small"
                  clickable
                  onClick={() => {
                    setSearchQuery(suburb);
                    navigate(`/properties?search=${encodeURIComponent(suburb)}`);
                  }}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    border: '1px solid',
                    bgcolor: 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(20, 184, 166, 0.2)',
                      borderColor: '#14b8a6',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ width: '100%', flex: '1 1 42%', minWidth: 0, maxWidth: { md: '42%' } }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {[
                { icon: <Home />, value: '10,000+', label: 'Properties Listed' },
                { icon: <TrendingUp />, value: '98%', label: 'AI Accuracy' },
                { icon: <Sell />, value: '$2.5B', label: 'Properties Sold' },
                { icon: <LocationOn />, value: '500+', label: 'Suburbs Covered' },
              ].map((stat, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 3,
                    width: '100%',
                    minHeight: { md: 120 },
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.08)',
                      borderColor: 'rgba(20, 184, 166, 0.3)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box sx={{ color: '#14b8a6', mb: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>{stat.icon}</Box>
                  <Typography
                    variant="h4"
                    sx={{ color: 'white', fontWeight: 700, mb: 0.5, wordBreak: 'break-word', overflowWrap: 'anywhere', textAlign: 'center', fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' } }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'rgba(255,255,255,0.6)', whiteSpace: 'normal', overflowWrap: 'break-word', textAlign: 'center', fontSize: { xs: '0.65rem', sm: '0.875rem' } }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
