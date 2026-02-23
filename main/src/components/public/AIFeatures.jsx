
import { Box, Container, Typography, Grid, Paper, Chip } from '@mui/material';
import {
  Psychology,
  TrendingUp,
  Insights,
  Speed,
  Security,
  Support,
} from '@mui/icons-material';

const features = [
  {
    icon: <Psychology fontSize="large" />, title: 'AI Valuations', tag: 'Valuation', description: 'Get instant, data-driven property value estimates powered by advanced machine learning and real-time market data.'
  },
  {
    icon: <TrendingUp fontSize="large" />, title: 'Market Analysis', tag: 'Market', description: 'Track trends, compare suburbs, and analyze price movements with our AI-powered analytics.'
  },
  {
    icon: <Insights fontSize="large" />, title: 'Smart Recommendations', tag: 'Personalized', description: 'Receive personalized property matches and insights based on your unique preferences and search behavior.'
  },
  {
    icon: <Speed fontSize="large" />, title: 'Instant Processing', tag: 'Speed', description: 'Lightning-fast search and application processing with real-time data and automation.'
  },
  {
    icon: <Security fontSize="large" />, title: 'Secure Transactions', tag: 'Security', description: 'End-to-end encrypted transactions and document verification for peace of mind.'
  },
  {
    icon: <Support fontSize="large" />, title: 'AI Assistance', tag: 'Support', description: '24/7 AI-powered support to answer your questions and guide you through every step.'
  },
];

const AIFeatures = () => {
  return (
    <Box
      sx={{
        py: 10,
        bgcolor: '#0a1628',
        position: 'relative',
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
          backgroundImage: `radial-gradient(#14b8a6 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          opacity: 0.05,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 8, p: 2.5 }}>
          <Chip
            label="Powered by AI"
            sx={{
              mb: 2,
              bgcolor: 'rgba(20, 184, 166, 0.15)',
              color: '#14b8a6',
              fontWeight: 600,
              border: '1px solid rgba(20, 184, 166, 0.3)',
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 2,
            }}
          >
            The Future of Real Estate
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              maxWidth: 600,
              mx: 'auto',
              fontSize: '1.1rem',
            }}
          >
            Cutting-edge AI technology that makes buying and selling property smarter, faster, and more transparent.
          </Typography>
        </Box>
        <Grid container spacing={3} justifyContent="center" alignItems="stretch">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  maxWidth: 380,
                  width: '100%',
                  height: '100%',
                  bgcolor: 'rgba(255,255,255,0.03)',
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.06)',
                    borderColor: 'rgba(20, 184, 166, 0.3)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    color: '#14b8a6',
                  }}
                >
                  {feature.icon}
                </Box>

                <Chip
                  label={feature.tag}
                  size="small"
                  sx={{
                    mb: 2,
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14b8a6',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                />

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: 'white',
                    mb: 1.5,
                  }}
                >
                  {feature.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.7,
                  }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AIFeatures;
