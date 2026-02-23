import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,

  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Snackbar,
  useMediaQuery,
  useTheme,
  Fade,
  Collapse,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  PersonOutline,
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  ArrowForward,
  ArrowBack,
  HomeOutlined,
  PhoneOutlined,
  LocationOnOutlined,
  Check,
  MarkEmailReadOutlined,
  Refresh,
} from '@mui/icons-material';
import api from '../../services/api';
import LottieLoader from '../../components/LottieLoader';

import LogoLight from '../../assets/AI-RE Logo SVG/Primary Logo (Light Mode).svg';
import LogoDark from '../../assets/AI-RE Logo SVG/Primary Logo (Dark Mode).svg';

// ===== Custom Styled Components =====

const StyledStepConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    borderColor: '#e5e7eb',
    borderTopWidth: 3,
    borderRadius: 1,
  },
  '&.Mui-active .MuiStepConnector-line': {
    borderColor: '#14b8a6',
  },
  '&.Mui-completed .MuiStepConnector-line': {
    borderColor: '#14b8a6',
  },
}));

const StyledStepIcon = styled('div')(({ ownerState }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: ownerState.completed || ownerState.active 
    ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' 
    : '#e5e7eb',
  background: ownerState.completed || ownerState.active 
    ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' 
    : '#e5e7eb',
  color: ownerState.completed || ownerState.active ? '#fff' : '#9ca3af',
  fontWeight: 600,
  fontSize: 14,
  transition: 'all 0.3s ease',
  boxShadow: ownerState.active ? '0 0 0 4px rgba(20, 184, 166, 0.2)' : 'none',
}));

const CustomStepIcon = (props) => {
  const { active, completed, icon } = props;
  const icons = {
    1: <PersonOutline sx={{ fontSize: 18 }} />,
    2: <LocationOnOutlined sx={{ fontSize: 18 }} />,
    3: <LockOutlined sx={{ fontSize: 18 }} />,
    4: <MarkEmailReadOutlined sx={{ fontSize: 18 }} />,
  };

  return (
    <StyledStepIcon ownerState={{ completed, active }}>
      {completed ? <Check sx={{ fontSize: 18 }} /> : icons[String(icon)]}
    </StyledStepIcon>
  );
};

// Premium input styling
const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: '#e5e7eb',
      borderWidth: 2,
      transition: 'all 0.2s ease',
    },
    '&:hover fieldset': {
      borderColor: '#14b8a6',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#14b8a6',
      borderWidth: 2,
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 4px rgba(20, 184, 166, 0.15)',
    },
    '&.Mui-error fieldset': {
      borderColor: '#ef4444',
    },
    '&.Mui-error.Mui-focused': {
      boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.15)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#6b7280',
    '&.Mui-focused': {
      color: '#14b8a6',
    },
    '&.Mui-error': {
      color: '#ef4444',
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginTop: 1,
  },
};

// ===== Step Labels =====
const steps = ['Personal Info', 'Address', 'Security', 'Verify Email'];

// ===== Password Strength Component =====
const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const percentage = (strength / 5) * 100;
  
  const getColor = () => {
    if (strength <= 2) return '#ef4444';
    if (strength <= 3) return '#f59e0b';
    return '#10b981';
  };

  const getLabel = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength === 4) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 4,
          borderRadius: 2,
          backgroundColor: '#e5e7eb',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getColor(),
            borderRadius: 2,
          },
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          Password strength: <span style={{ color: getColor(), fontWeight: 600 }}>{getLabel()}</span>
        </Typography>
        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
          Min 8 chars, uppercase, lowercase, number
        </Typography>
      </Box>
    </Box>
  );
};

// ===== Main Component =====
const RegisterPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { isAuthenticated, loading: authLoading, isAdmin } = useAuth();
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);
  
  // Refs for auto-focus
  const inputRefs = useRef({});

  // ===== State =====
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    suburb: '',
    postcode: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [resendTimer, setResendTimer] = useState(0);
  const [codeExpiry, setCodeExpiry] = useState(0);



  // ===== Resend Timer =====
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // ===== Code Expiry Timer =====
  useEffect(() => {
    let interval;
    if (codeExpiry > 0) {
      interval = setInterval(() => {
        setCodeExpiry(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [codeExpiry]);

  // ===== Validation Functions =====
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return "What's your first name?";
        if (value.length < 2) return 'First name must be at least 2 characters';
        return '';
      
      case 'lastName':
        if (!value.trim()) return "What's your last name?";
        if (value.length < 2) return 'Last name must be at least 2 characters';
        return '';
      

      
      case 'address':
        if (!value.trim()) return "What's your street address?";
        return '';
      
      case 'suburb':
        if (!value.trim()) return "What's your suburb?";
        return '';
      
      case 'postcode':
        if (!value.trim()) return "What's your postcode?";
        if (!/^\d{4}$/.test(value)) return 'Please enter a 4-digit postcode';
        return '';
      
      case 'mobile':
        if (!value.trim()) return "What's your mobile number?";
        const cleanMobile = value.replace(/\s/g, '');
        if (!/^(\+61|0)4\d{8}$/.test(cleanMobile)) {
          return 'Enter a valid Australian mobile (04XX XXX XXX)';
        }
        return '';
      
      case 'email':
        if (!value.trim()) return "What's your email address?";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return '';
      
      case 'password':
        if (!value) return 'Create a password';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain a number';
        return '';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      
      case 'verificationCode':
        if (!value.trim()) return 'Enter the 6-digit code we sent to your email.';
        if (!/^\d{6}$/.test(value)) return 'OTP must be 6 digits';
        return '';
      
      default:
        return '';
    }
  }, [formData.password]);

  // ===== Field config per step =====
  const stepFields = {
    0: ['firstName', 'lastName'],
    1: ['address', 'suburb', 'postcode'],
    2: ['mobile', 'email', 'password', 'confirmPassword'],
    3: ['verificationCode'],
  };

  // ===== Validate current step =====
  const validateStep = () => {
    const currentFields = stepFields[activeStep];
    const newErrors = {};
    let firstErrorField = null;

    for (const field of currentFields) {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        if (!firstErrorField) firstErrorField = field;
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));

    // Auto-focus first error field
    if (firstErrorField && inputRefs.current[firstErrorField]) {
      inputRefs.current[firstErrorField].focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  // ===== Handlers =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (activeStep === 2) {
      // Submit registration and send verification code
      await handleSubmitRegistration();
    } else if (activeStep === 3) {
      // Verify code
      await handleVerifyCode();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmitRegistration = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register-init', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        suburb: formData.suburb,
        postcode: formData.postcode,
        mobile: formData.mobile,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Verification code sent to your email!',
          severity: 'success',
        });
        setResendTimer(response.data.data.resendAvailableIn || 60);
        setCodeExpiry(response.data.data.expiresIn || 600);
        setActiveStep(3);
      }
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData?.errors) {
        setErrors(prev => ({ ...prev, ...errorData.errors }));
        
        // Find which step has the error and go back to it
        for (let step = 0; step <= 2; step++) {
          const fieldsWithError = stepFields[step].filter(f => errorData.errors[f]);
          if (fieldsWithError.length > 0) {
            setActiveStep(step);
            setTimeout(() => {
              if (inputRefs.current[fieldsWithError[0]]) {
                inputRefs.current[fieldsWithError[0]].focus();
              }
            }, 100);
            break;
          }
        }
      }
      
      setSnackbar({
        open: true,
        message: errorData?.message || 'Registration failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/verify', {
        email: formData.email,
        code: formData.verificationCode,
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Account created successfully! Redirecting to login...',
          severity: 'success',
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      const errorData = error.response?.data;
      setSnackbar({
        open: true,
        message: errorData?.message || 'Invalid verification code. Please try again.',
        severity: 'error',
      });
      
      if (errorData?.attemptsRemaining !== undefined) {
        setErrors(prev => ({
          ...prev,
          verificationCode: `Invalid code. ${errorData.attemptsRemaining} attempts remaining.`
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      const response = await api.post('/auth/resend-code', {
        email: formData.email,
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'New verification code sent!',
          severity: 'success',
        });
        setResendTimer(response.data.data.resendAvailableIn || 60);
        setCodeExpiry(response.data.data.expiresIn || 600);
        setFormData(prev => ({ ...prev, verificationCode: '' }));
        setErrors(prev => ({ ...prev, verificationCode: '' }));
      }
    } catch (error) {
      const errorData = error.response?.data;
      setSnackbar({
        open: true,
        message: errorData?.message || 'Failed to resend code. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== Format time helper =====
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ===== Render Step Content =====
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in timeout={300}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" sx={{ color: '#0a1628', fontWeight: 600, mb: 1 }}>
                Let's get started with your details
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  inputRef={el => inputRefs.current.firstName = el}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline sx={{ color: '#9ca3af' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyles}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  inputRef={el => inputRefs.current.lastName = el}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline sx={{ color: '#9ca3af' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyles}
                />
              </Box>


            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={300}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" sx={{ color: '#0a1628', fontWeight: 600, mb: 1 }}>
                Where's your property located?
              </Typography>

              <TextField
                fullWidth
                label="Street Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.address}
                helperText={errors.address}
                inputRef={el => inputRefs.current.address = el}
                placeholder="123 Example Street"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeOutlined sx={{ color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label="Suburb"
                  name="suburb"
                  value={formData.suburb}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.suburb}
                  helperText={errors.suburb}
                  inputRef={el => inputRefs.current.suburb = el}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnOutlined sx={{ color: '#9ca3af' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyles}
                />
                <TextField
                  fullWidth
                  label="Postcode"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.postcode}
                  helperText={errors.postcode}
                  inputRef={el => inputRefs.current.postcode = el}
                  placeholder="2000"
                  inputProps={{ maxLength: 4 }}
                  sx={inputStyles}
                />
              </Box>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={300}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" sx={{ color: '#0a1628', fontWeight: 600, mb: 1 }}>
                Contact & Security
              </Typography>

              <TextField
                fullWidth
                label="Mobile Number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.mobile}
                helperText={errors.mobile || 'Australian mobile: 04xx xxx xxx'}
                inputRef={el => inputRefs.current.mobile = el}
                placeholder="0412 345 678"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlined sx={{ color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />

              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.email}
                helperText={errors.email}
                inputRef={el => inputRefs.current.email = el}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />

              <Box>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.password}
                  helperText={errors.password}
                  inputRef={el => inputRefs.current.password = el}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#9ca3af' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#9ca3af' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyles}
                />
                <PasswordStrength password={formData.password} />
              </Box>

              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                inputRef={el => inputRefs.current.confirmPassword = el}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: '#9ca3af' }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Box>
          </Fade>
        );

      case 3:
        return (
          <Fade in timeout={300}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                }}
              >
                <MarkEmailRead sx={{ fontSize: 40, color: '#14b8a6' }} />
              </Box>

              <Box>
                <Typography variant="h6" sx={{ color: '#0a1628', fontWeight: 600, mb: 1 }}>
                  Check your email
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  We've sent a 6-digit verification code to
                </Typography>
                <Typography variant="body1" sx={{ color: '#0a1628', fontWeight: 600 }}>
                  {formData.email}
                </Typography>
              </Box>

              {codeExpiry > 0 && (
                <Alert severity="info" sx={{ width: '100%', borderRadius: 2 }}>
                  Code expires in <strong>{formatTime(codeExpiry)}</strong>
                </Alert>
              )}

              <TextField
                fullWidth
                label="Verification Code"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.verificationCode}
                helperText={errors.verificationCode}
                inputRef={el => inputRefs.current.verificationCode = el}
                placeholder="000000"
                inputProps={{ 
                  maxLength: 6,
                  style: { textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 600 }
                }}
                sx={{
                  ...inputStyles,
                  '& .MuiOutlinedInput-input': {
                    py: 2,
                  }
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Didn't receive the code?
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || loading}
                  startIcon={resendTimer > 0 ? null : <Refresh sx={{ fontSize: 16 }} />}
                  sx={{
                    color: resendTimer > 0 ? '#9ca3af' : '#14b8a6',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(20, 184, 166, 0.08)',
                    },
                  }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </Button>
              </Box>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  // ===== Main Render =====
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Panel - Desktop Only */}
      {!isMobile && (
        <Box
          sx={{
            width: '45%',
            bgcolor: '#0a1628',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
            overflow: 'hidden',
          }}
        >
          {/* Background Effects */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 20%, rgba(20, 184, 166, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.1) 0%, transparent 40%),
                radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.05) 0%, transparent 60%)
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
              backgroundImage: `radial-gradient(rgba(20, 184, 166, 0.3) 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
              opacity: 0.4,
            }}
          />

          {/* Floating Shapes */}
          <Box
            sx={{
              position: 'absolute',
              top: '15%',
              right: '10%',
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: '2px solid rgba(20, 184, 166, 0.3)',
              animation: 'float 6s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-20px)' },
              },
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '20%',
              left: '15%',
              width: 80,
              height: 80,
              borderRadius: 4,
              bgcolor: 'rgba(20, 184, 166, 0.1)',
              animation: 'float 8s ease-in-out infinite',
            }}
          />

          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 450 }}>
            <Box
              component="img"
              src={LogoDark}
              alt="Oakford Realty"
              sx={{
                height: 50,
                mb: 4,
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
              }}
            />

            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 800,
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              Start Selling
              <Box
                component="span"
                sx={{
                  display: 'block',
                  background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Smarter Today
              </Box>
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 400,
                mb: 4,
                lineHeight: 1.7,
              }}
            >
              Join thousands of Australian property sellers using AI-powered insights 
              to get the best price for their homes.
            </Typography>

            {/* Benefits */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { icon: '🤖', text: 'AI-powered property valuations' },
                { icon: '📊', text: 'Real-time market insights' },
                { icon: '💰', text: 'Competitive flat-fee pricing' },
                { icon: '📱', text: 'Manage everything from your dashboard' },
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Typography sx={{ fontSize: 24 }}>{item.icon}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Right Panel - Form */}
      <Box
        sx={{
          width: isMobile ? '100%' : '55%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#f8fafc',
          p: { xs: 3, sm: 4, md: 6 },
          position: 'relative',
          minHeight: '100vh',
        }}
      >
        {/* Mobile Logo */}
        {isMobile && (
          <Box
            component={Link}
            to="/"
            sx={{
              position: 'absolute',
              top: 24,
              left: 24,
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src={LogoLight}
              alt="Oakford Realty"
              sx={{ height: 32 }}
            />
          </Box>
        )}

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 520,
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            border: '1px solid #e5e7eb',
            bgcolor: 'white',
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0a1628', mb: 1 }}>
              Create Seller Account
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Already have an account?{' '}
              <Link to="/auth?mode=login" style={{ color: '#14b8a6', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<StyledStepConnector />}
            sx={{ mb: 4 }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={CustomStepIcon}
                  sx={{
                    '& .MuiStepLabel-label': {
                      mt: 1,
                      fontSize: 12,
                      fontWeight: activeStep === index ? 600 : 400,
                      color: activeStep === index ? '#0a1628' : '#9ca3af',
                    },
                  }}
                >
                  {!isMobile && label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ minHeight: 320, mb: 4 }}>
            {renderStepContent()}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              startIcon={<ArrowBack />}
              sx={{
                borderColor: '#e5e7eb',
                color: '#6b7280',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                visibility: activeStep === 0 ? 'hidden' : 'visible',
                '&:hover': {
                  borderColor: '#9ca3af',
                  bgcolor: '#f9fafb',
                },
              }}
            >
              Back
            </Button>

            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              endIcon={loading ? <LottieLoader size={18} invert /> : <ArrowForward />}
              sx={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(20, 184, 166, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  boxShadow: '0 6px 20px rgba(20, 184, 166, 0.4)',
                },
                '&:disabled': {
                  background: '#e5e7eb',
                  color: '#9ca3af',
                },
              }}
            >
              {loading ? 'Processing...' : activeStep === 2 ? 'Send Verification' : activeStep === 3 ? 'Verify & Create Account' : 'Continue'}
            </Button>
          </Box>
        </Paper>

        {/* Footer */}
        <Typography variant="caption" sx={{ mt: 3, color: '#9ca3af', textAlign: 'center' }}>
          By creating an account, you agree to our{' '}
          <Link to="/terms" style={{ color: '#14b8a6' }}>Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" style={{ color: '#14b8a6' }}>Privacy Policy</Link>
        </Typography>
      </Box>

    </Box>
  );
};

export default RegisterPage;
