import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PropertyCard from './PropertyCard';

const featuredProperties = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    price: 1250000,
    address: '42 Harbour View Drive',
    suburb: 'Mosman',
    state: 'NSW',
    postcode: '2088',
    beds: 4,
    baths: 3,
    cars: 2,
    sqm: 450,
    propertyType: 'House',
    status: 'New',
    openHome: 'Sat 10:00am',
    daysOnMarket: 3,
    aiEstimate: 1280000,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    price: 875000,
    address: '15/88 Pacific Highway',
    suburb: 'North Sydney',
    state: 'NSW',
    postcode: '2060',
    beds: 2,
    baths: 2,
    cars: 1,
    sqm: 95,
    propertyType: 'Apartment',
    status: 'Open Home',
    openHome: 'Sun 11:00am',
    daysOnMarket: 7,
    aiEstimate: 890000,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    price: 2150000,
    address: '8 Riverview Terrace',
    suburb: 'Toorak',
    state: 'VIC',
    postcode: '3142',
    beds: 5,
    baths: 4,
    cars: 3,
    sqm: 680,
    propertyType: 'House',
    status: 'Price Reduced',
    daysOnMarket: 21,
    aiEstimate: 2200000,
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    price: 695000,
    address: '23 Sunset Boulevard',
    suburb: 'Surfers Paradise',
    state: 'QLD',
    postcode: '4217',
    beds: 3,
    baths: 2,
    cars: 2,
    sqm: 180,
    propertyType: 'Townhouse',
    openHome: 'Sat 2:00pm',
    daysOnMarket: 14,
    aiEstimate: 710000,
  },
];

const FeaturedListings = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 10, bgcolor: '#f8fafc' }}>
      <Container maxWidth="xl">
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            mb: 5,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#0a1628',
                mb: 1,
                
              }}
            >
              Featured Properties
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', maxWidth: 500 }}>
              Hand-picked properties with AI-verified valuations and high buyer interest
            </Typography>
          </Box>
          <Button
            variant="outlined"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/properties')}
            sx={{
              borderColor: '#14b8a6',
              color: '#14b8a6',
              '&:hover': {
                borderColor: '#0d9488',
                bgcolor: 'rgba(20, 184, 166, 0.05)',
              },
            }}
          >
            View All Properties
          </Button>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {featuredProperties.map((property) => (
            <Grid item xs={12} sm={6} lg={3} key={property.id}>
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedListings;
