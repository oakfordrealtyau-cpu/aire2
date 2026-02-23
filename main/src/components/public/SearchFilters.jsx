import { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Collapse,
  Grid,
  Chip,
  IconButton,
  Typography,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Search,
  FilterList,
  Close,
  ExpandMore,
  ExpandLess,
  LocationOn,
} from '@mui/icons-material';

const propertyTypes = ['All', 'House', 'Apartment', 'Townhouse', 'Villa', 'Land', 'Rural'];
const bedsOptions = ['Any', '1+', '2+', '3+', '4+', '5+'];
const bathsOptions = ['Any', '1+', '2+', '3+', '4+'];
const carsOptions = ['Any', '1+', '2+', '3+'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price (Low to High)' },
  { value: 'price-high', label: 'Price (High to Low)' },
  { value: 'beds', label: 'Bedrooms' },
];

const SearchFilters = ({ onSearch, onFilterChange, initialFilters = {} }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    propertyType: 'All',
    minPrice: 0,
    maxPrice: 5000000,
    beds: 'Any',
    baths: 'Any',
    cars: 'Any',
    sort: 'newest',
    keywords: [],
    ...initialFilters,
  });

  const [searchInput, setSearchInput] = useState(filters.search);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleSearch = () => {
    handleFilterChange('search', searchInput);
    if (onSearch) {
      onSearch({ ...filters, search: searchInput });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleKeywordRemove = (keyword) => {
    const newKeywords = filters.keywords.filter((k) => k !== keyword);
    handleFilterChange('keywords', newKeywords);
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      propertyType: 'All',
      minPrice: 0,
      maxPrice: 5000000,
      beds: 'Any',
      baths: 'Any',
      cars: 'Any',
      sort: 'newest',
      keywords: [],
    };
    setFilters(defaultFilters);
    setSearchInput('');
    if (onFilterChange) {
      onFilterChange(defaultFilters);
    }
  };

  const formatPrice = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const activeFiltersCount = [
    filters.propertyType !== 'All',
    filters.beds !== 'Any',
    filters.baths !== 'Any',
    filters.cars !== 'Any',
    filters.minPrice > 0,
    filters.maxPrice < 5000000,
    filters.keywords.length > 0,
  ].filter(Boolean).length;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: 'white',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Search by suburb, postcode, or address..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#f9fafb',
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            px: 4,
            bgcolor: '#14b8a6',
            '&:hover': { bgcolor: '#0d9488' },
            width: { xs: '100%', sm: 'auto' },
            mt: { xs: 1, sm: 0 },
          }}
          startIcon={<Search />}
        >
          Search
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          mb: 2,
        }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: '48%', sm: 140 } }}>
          <InputLabel>Property Type</InputLabel>
          <Select
            value={filters.propertyType}
            label="Property Type"
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
          >
            {propertyTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '30%', sm: 100 } }}>
          <InputLabel>Beds</InputLabel>
          <Select
            value={filters.beds}
            label="Beds"
            onChange={(e) => handleFilterChange('beds', e.target.value)}
          >
            {bedsOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '30%', sm: 100 } }}>
          <InputLabel>Baths</InputLabel>
          <Select
            value={filters.baths}
            label="Baths"
            onChange={(e) => handleFilterChange('baths', e.target.value)}
          >
            {bathsOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '30%', sm: 100 } }}>
          <InputLabel>Cars</InputLabel>
          <Select
            value={filters.cars}
            label="Cars"
            onChange={(e) => handleFilterChange('cars', e.target.value)}
          >
            {carsOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={() => setShowAdvanced(!showAdvanced)}
          endIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
          sx={{
            borderColor: activeFiltersCount > 0 ? '#14b8a6' : 'divider',
            color: activeFiltersCount > 0 ? '#14b8a6' : 'text.secondary',
          }}
        >
          <FilterList sx={{ mr: 1 }} />
          Filters
          {activeFiltersCount > 0 && (
            <Chip
              label={activeFiltersCount}
              size="small"
              sx={{ ml: 1, height: 20, bgcolor: '#14b8a6', color: 'white' }}
            />
          )}
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <FormControl size="small" sx={{ minWidth: { xs: '48%', sm: 160 } }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sort}
            label="Sort By"
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            {sortOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Collapse in={showAdvanced}>
        <Box
          sx={{
            pt: 3,
            mt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Price Range
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  onChange={(e, newValue) => {
                    handleFilterChange('minPrice', newValue[0]);
                    handleFilterChange('maxPrice', newValue[1]);
                  }}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatPrice}
                  min={0}
                  max={5000000}
                  step={50000}
                  sx={{
                    color: '#14b8a6',
                    '& .MuiSlider-thumb': {
                      bgcolor: '#14b8a6',
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatPrice(filters.minPrice)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatPrice(filters.maxPrice)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Features
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['Pool', 'Garden', 'Air Conditioning', 'Solar', 'Study', 'Renovated'].map(
                  (keyword) => (
                    <Chip
                      key={keyword}
                      label={keyword}
                      clickable
                      onClick={() => {
                        const newKeywords = filters.keywords.includes(keyword)
                          ? filters.keywords.filter((k) => k !== keyword)
                          : [...filters.keywords, keyword];
                        handleFilterChange('keywords', newKeywords);
                      }}
                      sx={{
                        bgcolor: filters.keywords.includes(keyword) ? '#14b8a6' : 'transparent',
                        color: filters.keywords.includes(keyword) ? 'white' : 'text.primary',
                        borderColor: filters.keywords.includes(keyword) ? '#14b8a6' : 'divider',
                        border: '1px solid',
                        '&:hover': {
                          bgcolor: filters.keywords.includes(keyword)
                            ? '#0d9488'
                            : 'rgba(20, 184, 166, 0.1)',
                        },
                      }}
                    />
                  )
                )}
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="text" onClick={clearFilters} startIcon={<Close />}>
              Clear All Filters
            </Button>
          </Box>
        </Box>
      </Collapse>

      {filters.keywords.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {filters.keywords.map((keyword) => (
            <Chip
              key={keyword}
              label={keyword}
              onDelete={() => handleKeywordRemove(keyword)}
              size="small"
              sx={{
                bgcolor: 'rgba(20, 184, 166, 0.1)',
                color: '#0d9488',
                '& .MuiChip-deleteIcon': { color: '#0d9488' },
              }}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default SearchFilters;
