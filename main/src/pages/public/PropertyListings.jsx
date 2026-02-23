import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Pagination,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Paper,
} from '@mui/material';
import { GridView, ViewList, Map } from '@mui/icons-material';
import SearchFilters from '../../components/public/SearchFilters';
import PropertyCard from '../../components/public/PropertyCard';

const mockProperties = [
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
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
    price: 980000,
    address: '156 Beachfront Avenue',
    suburb: 'Bondi Beach',
    state: 'NSW',
    postcode: '2026',
    beds: 3,
    baths: 2,
    cars: 1,
    sqm: 120,
    propertyType: 'Apartment',
    status: 'New',
    daysOnMarket: 1,
    aiEstimate: 995000,
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
    price: 1450000,
    address: '78 Parklands Drive',
    suburb: 'Brighton',
    state: 'VIC',
    postcode: '3186',
    beds: 4,
    baths: 2,
    cars: 2,
    sqm: 520,
    propertyType: 'House',
    openHome: 'Sun 1:00pm',
    daysOnMarket: 10,
    aiEstimate: 1480000,
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
    price: 520000,
    address: '45/12 Marina Way',
    suburb: 'Manly',
    state: 'NSW',
    postcode: '2095',
    beds: 1,
    baths: 1,
    cars: 1,
    sqm: 55,
    propertyType: 'Apartment',
    status: 'Under Offer',
    daysOnMarket: 28,
    aiEstimate: 535000,
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800',
    price: 1850000,
    address: '22 Hillside Crescent',
    suburb: 'Double Bay',
    state: 'NSW',
    postcode: '2028',
    beds: 5,
    baths: 3,
    cars: 2,
    sqm: 620,
    propertyType: 'House',
    status: 'New',
    openHome: 'Sat 11:30am',
    daysOnMarket: 5,
    aiEstimate: 1900000,
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    price: 3200000,
    address: '1 Waterfront Estate',
    suburb: 'Point Piper',
    state: 'NSW',
    postcode: '2027',
    beds: 6,
    baths: 5,
    cars: 4,
    sqm: 850,
    propertyType: 'House',
    daysOnMarket: 45,
    aiEstimate: 3300000,
  },
  {
    id: 10,
    image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800',
    price: 750000,
    address: '89 Garden Street',
    suburb: 'Paddington',
    state: 'QLD',
    postcode: '4064',
    beds: 3,
    baths: 2,
    cars: 1,
    sqm: 350,
    propertyType: 'Townhouse',
    openHome: 'Sun 10:00am',
    daysOnMarket: 12,
    aiEstimate: 765000,
  },
  {
    id: 11,
    image: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800',
    price: 620000,
    address: '33/200 City Road',
    suburb: 'Southbank',
    state: 'VIC',
    postcode: '3006',
    beds: 2,
    baths: 1,
    cars: 1,
    sqm: 75,
    propertyType: 'Apartment',
    status: 'Price Reduced',
    daysOnMarket: 35,
    aiEstimate: 640000,
  },
  {
    id: 12,
    image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800',
    price: 1100000,
    address: '67 River Road',
    suburb: 'Hawthorne',
    state: 'QLD',
    postcode: '4171',
    beds: 4,
    baths: 2,
    cars: 2,
    sqm: 480,
    propertyType: 'House',
    openHome: 'Sat 9:00am',
    daysOnMarket: 8,
    aiEstimate: 1120000,
  },
];

const PropertyListings = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const propertiesPerPage = 12;

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setProperties(mockProperties);
      setTotalPages(Math.ceil(mockProperties.length / propertiesPerPage));
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (filters) => {
    console.log('Search filters:', filters);
  };

  const handleFilterChange = (filters) => {
    console.log('Filter changed:', filters);
  };

  const paginatedProperties = properties.slice(
    (page - 1) * propertiesPerPage,
    page * propertiesPerPage
  );

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: { xs: 2, sm: 4 }, overflowX: 'hidden' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ mb: { xs: 3, sm: 4 } }}>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: '#0a1628', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              Properties for Sale
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              {searchQuery
                ? `Showing results for "${searchQuery}"`
                : 'Browse all available properties across Australia'}
            </Typography>
          </Box>

          {/* Main Layout: Sidebar + Content */}
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, md: 4 },
              alignItems: 'flex-start',
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            {/* Sidebar - filters */}
            <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: 280 } }}>
              <SearchFilters
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                initialFilters={{ search: searchQuery }}
              />
            </Box>

            {/* Main content - controls + listings */}
            <Box sx={{ flex: 1, minWidth: 0, width: { xs: '100%' } }}>
              {/* Controls bar */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: '',
                  alignItems: 'center',
                  mb: 3,
                  flexWrap: 'wrap',
                  gap: { xs: 1.5, sm: 2 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                    {properties.length} properties
                  </Typography>
                  <Chip
                    label="AI Valuations"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(20, 184, 166, 0.1)',
                      color: '#0d9488',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewChange}
                  size="small"
                  sx={{
                    '& button': {
                      px: { xs: 1, sm: 1.5 },
                      py: { xs: 0.5, sm: 0.75 }
                    }
                  }}
                >
                  <ToggleButton value="grid" aria-label="grid view">
                    <GridView fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <ViewList fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="map" aria-label="map view">
                    <Map fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Content Area */}
              {loading ? (
                // Loading skeletons
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ justifyContent: 'center' }}>
                  {[...Array(8)].map((_, index) => (
                    <Grid
                      item
                      xs={viewMode === 'list' ? 12 : 12}
                      sm={viewMode === 'list' ? 12 : 6}
                      md={viewMode === 'list' ? 12 : 6}
                      lg={viewMode === 'list' ? 12 : 6}
                      key={index}
                      sx={{ display: 'flex' }}
                    >
                      <Paper sx={{ borderRadius: 2, overflow: 'hidden', width: '100%', height: '100%' }}>
                        <Skeleton variant="rectangular" height={120} />
                        <Box sx={{ p: 1.5 }}>
                          <Skeleton variant="text" width="60%" height={28} />
                          <Skeleton variant="text" width="80%" height={16} />
                          <Skeleton variant="text" width="40%" height={16} />
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Skeleton variant="text" width={35} />
                            <Skeleton variant="text" width={35} />
                            <Skeleton variant="text" width={35} />
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : viewMode === 'map' ? (
                // Map view
                <Paper
                  elevation={0}
                  sx={{
                    height: { xs: 300, sm: 400, md: 600 },
                    borderRadius: 2,
                    bgcolor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Map View Coming Soon
                  </Typography>
                </Paper>
              ) : (
                // Property listings grid/list
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ justifyContent: 'center' }}>
                  {paginatedProperties.map((property) => (
                    <Grid
                      item
                      xs={viewMode === 'list' ? 12 : 12}
                      sm={viewMode === 'list' ? 12 : 6}
                      md={viewMode === 'list' ? 12 : 6}
                      lg={viewMode === 'list' ? 12 : 6}
                      key={property.id}
                      sx={{ display: 'flex' }}
                    >
                      <Box sx={{ width: '100%', height: '100%' }}>
                        <PropertyCard property={property} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Pagination */}
              {!loading && properties.length > propertiesPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 4, md: 6 }, px: { xs: 1 } }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size={{ xs: 'small', sm: 'medium' }}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontWeight: 500,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      },
                      '& .Mui-selected': {
                        bgcolor: '#14b8a6 !important',
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PropertyListings;
