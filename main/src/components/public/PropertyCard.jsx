import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import {
  FavoriteBorder,
  Favorite,
  BedOutlined,
  BathtubOutlined,
  DirectionsCarOutlined,
  SquareFoot,
  CalendarMonth,
} from '@mui/icons-material';

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const {
    id,
    image,
    price,
    priceLabel,
    address,
    suburb,
    state,
    postcode,
    beds,
    baths,
    cars,
    sqm,
    propertyType,
    status,
    openHome,
    daysOnMarket,
    aiEstimate,
  } = property;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return { bg: '#14b8a6', color: 'white' };
      case 'under offer':
        return { bg: '#f59e0b', color: 'white' };
      case 'price reduced':
        return { bg: '#ef4444', color: 'white' };
      case 'open home':
        return { bg: '#3b82f6', color: 'white' };
      default:
        return { bg: '#6b7280', color: 'white' };
    }
  };

  const statusStyle = getStatusColor(status);

  return (
    <Card
      onClick={() => navigate(`/properties/${id}`)}
      sx={{
        cursor: 'pointer',
        height: '100%',
     
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        },
      }}
    >
      <Box sx={{ position: 'relative', flex: '0 0 200px', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'}
          alt={address}
          sx={{
            objectFit: 'cover',
            height: { xs: 200, sm: 180, md: 160 },
            width: '100%',
          }}
        />

        {status && (
          <Chip
            label={status}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: statusStyle.bg,
              color: statusStyle.color,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        )}

        {openHome && (
          <Chip
            icon={<CalendarMonth sx={{ fontSize: 16, color: 'white !important' }} />}
            label={openHome}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              fontWeight: 500,
              fontSize: '0.7rem',
              '& .MuiChip-icon': { color: 'white' },
            }}
          />
        )}

        <IconButton
          onClick={handleFavoriteClick}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'white' },
          }}
        >
          {isFavorite ? (
            <Favorite sx={{ color: '#ef4444' }} />
          ) : (
            <FavoriteBorder sx={{ color: '#6b7280' }} />
          )}
        </IconButton>

        <Chip
          label={propertyType}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            bgcolor: 'rgba(255,255,255,0.95)',
            fontWeight: 500,
            fontSize: '0.7rem',
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ mb: 1.25 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            color="primary.main"
            sx={{ fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' } }}
          >
            {priceLabel || `$${price?.toLocaleString()}`}
          </Typography>
          {aiEstimate && (
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              AI Estimate: ${aiEstimate.toLocaleString()}
            </Typography>
          )}
        </Box>

        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{
            mb: 0.5,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {address}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {suburb}, {state} {postcode}
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          sx={{
            mt: 'auto',
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BedOutlined sx={{ fontSize: 16, color: '#6b7280' }} />
            <Typography variant="body2" fontWeight={500}>
              {beds}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BathtubOutlined sx={{ fontSize: 16, color: '#6b7280' }} />
            <Typography variant="body2" fontWeight={500}>
              {baths}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DirectionsCarOutlined sx={{ fontSize: 16, color: '#6b7280' }} />
            <Typography variant="body2" fontWeight={500}>
              {cars}
            </Typography>
          </Box>
          {sqm && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SquareFoot sx={{ fontSize: 16, color: '#6b7280' }} />
              <Typography variant="body2" fontWeight={500}>
                {sqm}m²
              </Typography>
            </Box>
          )}
        </Stack>

        {daysOnMarket !== undefined && (
          <Typography
            variant="caption"
            sx={{
              mt: 1.5,
              color: '#9ca3af',
              display: 'block',
            }}
          >
            {daysOnMarket === 0 ? 'Listed today' : `${daysOnMarket} days on market`}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
