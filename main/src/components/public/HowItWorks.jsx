import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { Search, SmartToy, Description, Handshake } from '@mui/icons-material';

const steps = [
  {
    icon: <Search sx={{ fontSize: 40 }} />,
    title: 'Search & Discover',
    description:
      'Browse thousands of properties with our intelligent search. Filter by location, price, features, and more.',
  },
  {
    icon: <SmartToy sx={{ fontSize: 40 }} />,
    title: 'AI-Powered Insights',
    description:
      'Get instant AI valuations, market analysis, and personalized recommendations for every property.',
  },
  {
    icon: <Description sx={{ fontSize: 40 }} />,
    title: 'Book & Inspect',
    description:
      'Schedule inspections directly through the platform. Our AI assistant AIVA handles all communications.',
  },
  {
    icon: <Handshake sx={{ fontSize: 40 }} />,
    title: 'Make an Offer',
    description:
      'Submit offers digitally with full transparency. Track your offer status in real-time.',
  },
];

const HowItWorks = () => {
  return (
    <Box sx={{ py: 10, bgcolor: 'white' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8, p: 2.5 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#0a1628',
              mb: 2,
            }}
          >
            How Ai-re Works
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#6b7280',
              maxWidth: 600,
              mx: 'auto',
              fontSize: '1.1rem',
            }}
          >
            Experience a smarter way to buy property. Our AI-powered platform makes every step simple and transparent.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  maxWidth: 360,
                  width: '100%',
                  height: '100%',
                  textAlign: 'center',
                  borderRadius: 4,
                  bgcolor: '#f8fafc',
                  border: '1px solid',
                  borderColor: 'transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#14b8a6',
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: '#14b8a6',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  {index + 1}
                </Box>

                <Box
                  sx={{
                    color: '#14b8a6',
                    mb: 2,
                  }}
                >
                  {step.icon}
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#0a1628',
                    mb: 1.5,
                  }}
                >
                  {step.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#6b7280',
                    lineHeight: 1.7,
                  }}
                >
                  {step.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HowItWorks;
