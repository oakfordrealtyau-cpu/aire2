import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  InputAdornment,
  DialogActions,
  TextField,
  Stack,
  ImageList,
  ImageListItem,
} from '@mui/material';
import LottieLoader from '../../components/LottieLoader';
import SearchFilters from '../../components/public/SearchFilters';
import {
  ArrowBack,
  FavoriteBorder,
  Favorite,
  Share,
  Search,
  FilterList,
  BedOutlined,
  BathtubOutlined,
  DirectionsCarOutlined,
  SquareFoot,
  CalendarMonth,
  LocationOn,
  TrendingUp,
  Psychology,
  CheckCircle,
  Schedule,
  Email,
  Phone,
  ChatBubbleOutline,
} from '@mui/icons-material';

const mockProperty = {
  id: 1,
  images: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
  ],
  price: 1250000,
  priceLabel: '$1,250,000',
  address: '42 Harbour View Drive',
  suburb: 'Mosman',
  state: 'NSW',
  postcode: '2088',
  beds: 4,
  baths: 3,
  cars: 2,
  sqm: 450,
  landSize: 650,
  propertyType: 'House',
  status: 'For Sale',
  daysOnMarket: 3,
  aiEstimate: { low: 1200000, mid: 1280000, high: 1350000 },
  demandScore: 8.2,
  views: 1247,
  enquiries: 23,
  saves: 89,
  description: `This stunning contemporary residence offers the perfect blend of luxury living and harbour views. Nestled in one of Mosman's most prestigious streets, this architectural masterpiece features:

• Open-plan living and dining areas with floor-to-ceiling windows
• Gourmet kitchen with premium appliances and stone benchtops
• Master suite with walk-in robe and ensuite with harbour views
• Private landscaped gardens and entertainer's deck
• Heated swimming pool and spa
• Double lock-up garage with internal access

Located moments from Balmoral Beach, local cafes, and elite schools, this property represents an exceptional opportunity for discerning buyers seeking the ultimate Sydney lifestyle.`,
  features: [
    'Harbour Views',
    'Swimming Pool',
    'Air Conditioning',
    'Alarm System',
    'Built-in Wardrobes',
    'Dishwasher',
    'Floorboards',
    'Intercom',
    'Indoor Spa',
    'Outdoor Entertaining',
    'Secure Parking',
    'Study',
  ],
  inspections: [
    { date: 'Saturday, 1 Feb 2026', time: '10:00am - 10:30am' },
    { date: 'Sunday, 2 Feb 2026', time: '11:00am - 11:30am' },
  ],
  agent: {
    name: 'AIVA',
    title: 'AI Virtual Assistant',
    avatar: null,
    isAI: true,
  },
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [enquireDialog, setEnquireDialog] = useState(false);
  const [inspectionDialog, setInspectionDialog] = useState(false);
  const [offerDialog, setOfferDialog] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setProperty(mockProperty);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  if (loading || !property) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <LottieLoader size={48} />
      </Box>
    );
  }

  const formatPrice = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          position: 'sticky',
   
          zIndex: 100,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ color: '#6b7280' }}
                fullWidth={true}
              >
                Back to listings
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <IconButton onClick={() => setIsFavorite(!isFavorite)}>
                  {isFavorite ? <Favorite sx={{ color: '#ef4444' }} /> : <FavoriteBorder />}
                </IconButton>
                <IconButton>
                  <Share />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Use the shared SearchFilters component for consistent, responsive UI */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <SearchFilters
            onSearch={(vals) => console.log('search:', vals)}
            onFilterChange={(vals) => console.log('filters:', vals)}
            initialFilters={{}}
          />
        </Box>
        {/* ...existing code... */}
        <Grid container spacing={6} columnSpacing={{ md: 8 }}>
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{ borderRadius: 4, overflow: 'hidden', mb: { xs: 3, md: 4 } }}
            >
              <Box
                component="img"
                src={property.images[selectedImage]}
                alt={property.address}
                sx={{
                  width: '100%',
                  height: 500,
                  objectFit: 'cover',
                }}
              />
            </Paper>

            <ImageList cols={5} gap={10} sx={{ mb: { xs: 4, md: 6 }, overflowX: 'auto' }}>
              {property.images.map((img, index) => (
                <ImageListItem
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: selectedImage === index ? '3px solid #14b8a6' : '3px solid transparent',
                    opacity: selectedImage === index ? 1 : 0.7,
                    transition: 'all 0.2s',
                    '&:hover': { opacity: 1 },
                  }}
                >
                  <img src={img} alt={`View ${index + 1}`} style={{ height: 80, objectFit: 'cover', width: '100%' }} />
                </ImageListItem>
              ))}
            </ImageList>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, mb: { xs: 4, md: 6 } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ mb: 1 }}>
                    {property.priceLabel}
                  </Typography>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
                    {property.address}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <LocationOn sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {property.suburb}, {property.state} {property.postcode}
                  </Typography>
                </Box>
                <Chip
                  label={property.status}
                  sx={{ bgcolor: '#14b8a6', color: 'white', fontWeight: 600, px: 1 }}
                />
              </Box>

              <Stack
                direction="row"
                spacing={4}
                sx={{
                  py: 3,
                  borderTop: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  mb: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BedOutlined sx={{ color: '#6b7280' }} />
                  <Typography fontWeight={600}>{property.beds}</Typography>
                  <Typography color="text.secondary">Beds</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BathtubOutlined sx={{ color: '#6b7280' }} />
                  <Typography fontWeight={600}>{property.baths}</Typography>
                  <Typography color="text.secondary">Baths</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCarOutlined sx={{ color: '#6b7280' }} />
                  <Typography fontWeight={600}>{property.cars}</Typography>
                  <Typography color="text.secondary">Cars</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SquareFoot sx={{ color: '#6b7280' }} />
                  <Typography fontWeight={600}>{property.sqm}m²</Typography>
                  <Typography color="text.secondary">Living</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SquareFoot sx={{ color: '#6b7280' }} />
                  <Typography fontWeight={600}>{property.landSize}m²</Typography>
                  <Typography color="text.secondary">Land</Typography>
                </Box>
              </Stack>

              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                About this property
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#4b5563',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-line',
                  mb: 4,
                }}
              >
                {property.description}
              </Typography>

              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Features
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {property.features.map((feature) => (
                  <Chip
                    key={feature}
                    label={feature}
                    icon={<CheckCircle sx={{ fontSize: 16, color: '#14b8a6 !important' }} />}
                    sx={{
                      bgcolor: 'rgba(20, 184, 166, 0.1)',
                      color: '#0d9488',
                    }}
                  />
                ))}
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Open for Inspection
              </Typography>
              <Stack spacing={2}>
                {property.inspections.map((inspection, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      bgcolor: '#f8fafc',
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CalendarMonth sx={{ color: '#14b8a6' }} />
                      <Box>
                        <Typography fontWeight={600}>{inspection.date}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {inspection.time}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setInspectionDialog(true)}
                      sx={{
                        borderColor: '#14b8a6',
                        color: '#14b8a6',
                        '&:hover': {
                          borderColor: '#0d9488',
                          bgcolor: 'rgba(20, 184, 166, 0.05)',
                        },
                      }}
                    >
                      Book Inspection
                    </Button>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{
                p: { xs: 2.5, md: 4 },
                borderRadius: 4,
                mb: 4,
                background: 'linear-gradient(135deg, #0a1628 0%, #142140 100%)',
                color: 'white',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Psychology sx={{ color: '#14b8a6' }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  AI Valuation
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                {formatPrice(property.aiEstimate.mid)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                Range: {formatPrice(property.aiEstimate.low)} - {formatPrice(property.aiEstimate.high)}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  bgcolor: 'rgba(20, 184, 166, 0.15)',
                  borderRadius: 2,
                }}
              >
                <TrendingUp sx={{ color: '#14b8a6' }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Demand Score: {property.demandScore}/10
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    High buyer interest in this area
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Property Activity
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                      {property.views.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Views
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                      {property.enquiries}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Enquiries
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                      {property.saves}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Saves
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Typography
                variant="caption"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 2,
                  color: '#6b7280',
                }}
              >
                <Schedule sx={{ fontSize: 14 }} />
                Listed {property.daysOnMarket} days ago
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: '#14b8a6',
                    fontSize: '1.5rem',
                  }}
                >
                  🤖
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {property.agent.name}
                  </Typography>
                  <Chip
                    label="AI Virtual Assistant"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(20, 184, 166, 0.1)',
                      color: '#0d9488',
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                I'm AIVA, your AI assistant. I can answer questions about this property, schedule inspections, and help you submit an offer 24/7.
              </Typography>

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<ChatBubbleOutline />}
                  onClick={() => setEnquireDialog(true)}
                  sx={{
                    bgcolor: '#14b8a6',
                    py: 1.5,
                    '&:hover': { bgcolor: '#0d9488' },
                  }}
                >
                  Enquire Now
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CalendarMonth />}
                  onClick={() => setInspectionDialog(true)}
                  sx={{
                    borderColor: '#14b8a6',
                    color: '#14b8a6',
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#0d9488',
                      bgcolor: 'rgba(20, 184, 166, 0.05)',
                    },
                  }}
                >
                  Book Inspection
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setOfferDialog(true)}
                  sx={{
                    borderColor: '#0a1628',
                    color: '#0a1628',
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(10, 22, 40, 0.05)',
                    },
                  }}
                >
                  Submit Offer
                </Button>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: '#f8fafc',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                About Oakford Realty
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Oakford Realty is Australia's first AI-powered real estate platform. We use advanced technology to provide accurate valuations, transparent processes, and 24/7 support through our AI assistant AIVA.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog
        open={enquireDialog}
        onClose={() => setEnquireDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send an Enquiry</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            AIVA will respond to your enquiry within minutes.
          </Typography>
          <Stack spacing={2}>
            <TextField label="Full Name" fullWidth required />
            <TextField label="Email" type="email" fullWidth required />
            <TextField label="Phone" fullWidth />
            <TextField
              label="Message"
              multiline
              rows={4}
              fullWidth
              defaultValue={`Hi, I'm interested in ${property.address}. Please send me more information.`}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEnquireDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setEnquireDialog(false)}
            sx={{ bgcolor: '#14b8a6', '&:hover': { bgcolor: '#0d9488' } }}
          >
            Send Enquiry
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={inspectionDialog}
        onClose={() => setInspectionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Book an Inspection</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a time slot or request a private inspection.
          </Typography>
          <Stack spacing={2}>
            {property.inspections.map((inspection, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#14b8a6' },
                }}
              >
                <Typography fontWeight={600}>{inspection.date}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {inspection.time}
                </Typography>
              </Paper>
            ))}
            <Divider>or</Divider>
            <Button variant="outlined" fullWidth>
              Request Private Inspection
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setInspectionDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={offerDialog}
        onClose={() => setOfferDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Submit an Offer</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Submit your offer below. You'll need to sign up or log in to complete this process.
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Offer Amount"
              fullWidth
              required
              placeholder="$1,200,000"
            />
            <TextField label="Settlement Terms" fullWidth placeholder="30 days" />
            <TextField
              label="Conditions"
              multiline
              rows={3}
              fullWidth
              placeholder="e.g., Subject to finance, building inspection"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOfferDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setOfferDialog(false)}
            sx={{ bgcolor: '#14b8a6', '&:hover': { bgcolor: '#0d9488' } }}
          >
            Sign Up to Submit Offer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertyDetails;
