import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { Search, Sell, ArrowForward } from '@mui/icons-material';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 10, bgcolor: '#f8fafc' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 5,
                height: '100%',
                borderRadius: 4,
                bgcolor: 'white',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#14b8a6',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: 'rgba(20, 184, 166, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <Search sx={{ fontSize: 32, color: '#14b8a6' }} />
              </Box>

              <Typography variant="h4" fontWeight={700} sx={{ mb: 2, color: '#0a1628' }}>
                Looking to Buy?
              </Typography>

              <Typography variant="body1" sx={{ mb: 4, color: '#6b7280', lineHeight: 1.7 }}>
                Browse thousands of properties with AI-powered insights. Get instant valuations, 
                book inspections, and submit offers - all in one place.
              </Typography>

              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/properties')}
                sx={{
                  bgcolor: '#14b8a6',
                  '&:hover': { bgcolor: '#0d9488' },
                  px: 4,
                }}
              >
                Browse Properties
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 5,
                height: '100%',
                borderRadius: 4,
                bgcolor: '#0a1628',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
                },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: 'rgba(20, 184, 166, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <Sell sx={{ fontSize: 32, color: '#14b8a6' }} />
              </Box>

              <Typography variant="h4" fontWeight={700} sx={{ mb: 2, color: 'white' }}>
                Ready to Sell?
              </Typography>

              <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                List your property with Australia's first AI-powered platform. Get instant valuations, 
                manage offers, and sell smarter with our transparent process.
              </Typography>

              <Button
                variant="outlined"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/sell')}
                sx={{
                  borderColor: '#14b8a6',
                  color: '#14b8a6',
                  px: 4,
                  '&:hover': {
                    borderColor: '#14b8a6',
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                  },
                }}
              >
                List Your Property
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CTASection;
