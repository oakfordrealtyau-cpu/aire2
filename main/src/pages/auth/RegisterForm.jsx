import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
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
  LinearProgress,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import LottieLoader from '../../components/LottieLoader';
import { styled } from '@mui/material/styles';
import {
  PersonOutline,
  EmailOutlined,
  LockOutlined,
  Visibility,
  
  VisibilityOff,
  ArrowForward,
  ArrowBack,
  MarkEmailRead,
  HomeOutlined,
  PhoneOutlined,
  LocationOnOutlined,
  Check,
  MarkEmailReadOutlined,
  Refresh,
  Celebration,
} from '@mui/icons-material';
import api from '../../services/api';

// ===== Custom Styled Components =====
const StyledStepConnector = styled(StepConnector)(() => ({
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
  width: ownerState.mobile ? 34 : 40,
  height: ownerState.mobile ? 34 : 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background:
    ownerState.completed || ownerState.active
      ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
      : '#e5e7eb',
  color: ownerState.completed || ownerState.active ? '#fff' : '#9ca3af',
  fontWeight: 600,
  fontSize: 14,
  transition: 'all 0.3s ease',
  boxShadow: ownerState.active ? '0 0 0 4px rgba(20, 184, 166, 0.2)' : 'none',
}));

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)',
    },
  },
};

const steps = ['Personal Details', 'Contact Information', 'Account Security', 'Verify Email'];
const stepFields = [
  ['firstName', 'lastName'],
  ['address', 'suburb', 'postcode', 'mobile'],
  ['email', 'password', 'confirmPassword'],
  ['verificationCode'],
];

const onlyDigits = (value) => value.replace(/\D/g, '');
const formatMobile = (digits) => {
  const d = onlyDigits(digits).slice(0, 10);
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 10)}`;
};

const getErrorMessage = (error, fallback) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;
  return message;
};

const RegisterForm = ({ onSwitchToLogin, onRegistrationSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Refs
  const inputRefs = useRef({});
  const otpRefs = useRef([]);
  const allowLeaveRef = useRef(false);
  const historyGuardActiveRef = useRef(false);

  const navigate = useNavigate();


  // ===== State =====
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState({
    transition: false,
    submit: false,
    verify: false,
    resend: false,
  });
  const [loadingMessage, setLoadingMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    suburb: '',
    postcode: '',
    mobile: '', // digits only: 0412345678
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '', // OTP 6 digits
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [resendTimer, setResendTimer] = useState(0);
  const [codeExpiry, setCodeExpiry] = useState(0);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Leave confirmation state
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [pendingLeaveAction, setPendingLeaveAction] = useState(null); // { type: 'login'|'internal'|'external'|'pop', payload }

  // Consider the form dirty when any field has a value (prevents accidental leave)
  const isFormDirty = useMemo(() => {
    const hasValue = Object.keys(formData).some((k) => {
      const v = formData[k];
      return v !== null && v !== undefined && String(v).trim() !== '';
    });
    return hasValue && !successModalOpen;
  }, [formData, successModalOpen]);


  // Create one guard history entry when form becomes dirty
useEffect(() => {
  if (allowLeaveRef.current) return;

  if (isFormDirty && !historyGuardActiveRef.current) {
    window.history.pushState({ __leave_guard__: true }, '', window.location.href);
    historyGuardActiveRef.current = true;
  }

  if (!isFormDirty) {
    historyGuardActiveRef.current = false;
  }
}, [isFormDirty]);


  const isBusy =
    loading.transition || loading.submit || loading.verify || loading.resend;

  // ===== Custom Step Icon =====
  const CustomStepIcon = (props) => {
    const { active, completed, icon } = props;
    const icons = {
      1: <PersonOutline sx={{ fontSize: isMobile ? 16 : 18 }} />,
      2: <LocationOnOutlined sx={{ fontSize: isMobile ? 16 : 18 }} />,
      3: <LockOutlined sx={{ fontSize: isMobile ? 16 : 18 }} />,
      4: <MarkEmailReadOutlined sx={{ fontSize: isMobile ? 16 : 18 }} />,
    };

    return (
      <StyledStepIcon ownerState={{ completed, active, mobile: isMobile }}>
        {completed ? <Check sx={{ fontSize: isMobile ? 16 : 18 }} /> : icons[String(icon)]}
      </StyledStepIcon>
    );
  };

  // ===== Auto-focus first field on step change =====
  useEffect(() => {
    const firstField = stepFields[activeStep]?.[0];
    if (activeStep === 3) {
      const t = setTimeout(() => otpRefs.current[0]?.focus?.(), 140);
      return () => clearTimeout(t);
    }

    if (firstField && inputRefs.current[firstField]) {
      const t = setTimeout(() => inputRefs.current[firstField]?.focus?.(), 120);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [activeStep]);



  // ===== Resend timer =====
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // ===== Expiry timer =====
  useEffect(() => {
    let interval;
    if (codeExpiry > 0) {
      interval = setInterval(() => setCodeExpiry((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [codeExpiry]);

  // Warn user on browser tab close / refresh when form has unsaved data
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // don't block if user already confirmed leave
      if (!isFormDirty || allowLeaveRef.current) return;
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    if (isFormDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty]);

// Intercept browser back/forward while dirty
useEffect(() => {
  const onPopState = () => {
    if (allowLeaveRef.current) return;
    if (!isFormDirty) return;

    // Keep user on current page by immediately re-adding guard entry
    window.history.pushState({ __leave_guard__: true }, '', window.location.href);

    setPendingLeaveAction({ type: 'pop' });
    setConfirmLeaveOpen(true);
  };

  window.addEventListener('popstate', onPopState);
  return () => window.removeEventListener('popstate', onPopState);
}, [isFormDirty]);


  const handleLeave = () => {
    const action = pendingLeaveAction;

    setConfirmLeaveOpen(false);
    setPendingLeaveAction(null);

    // Temporarily allow navigation to bypass guards.
    allowLeaveRef.current = true;

    if (!action) return;

   if (action.type === 'pop') {
  // allow real navigation now
  allowLeaveRef.current = true;
  historyGuardActiveRef.current = false;

  // -2: one for the guard entry, one for the actual previous page
  if (window.history.length > 2) {
    window.history.go(-2);
  } else {
    // fallback if no meaningful history (direct-open tab)
    window.location.assign('/');
  }

  // safety reset if still on same page
  setTimeout(() => {
    allowLeaveRef.current = false;
  }, 800);

  return;
}

    if (action.type === 'login') {
      if (onSwitchToLogin) onSwitchToLogin();
      else navigate('/auth?mode=login');
      return;
    }

    if (action.type === 'internal') {
      const href = action.payload || '';
      if (!href) return;

      if (/^https?:\/\//i.test(href)) {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
          navigate(`${url.pathname}${url.search}${url.hash}`);
          return;
        }
      }

      navigate(href);
      return;
    }

    if (action.type === 'external') {
      const target = action.payload || '';
      if (target) window.location.assign(target);
    }
  };

  const handleStay = () => {
    setConfirmLeaveOpen(false);
    setPendingLeaveAction(null);
    allowLeaveRef.current = false;
  };

  // Intercept document clicks on <a> elements to prevent SPA navigation when dirty.
  useEffect(() => {
    const onDocumentClick = (e) => {
      if (allowLeaveRef.current) return;
      if (!isFormDirty) return;
      if (e.defaultPrevented) return;

      // Only handle plain left-clicks (no modifier keys).
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = e.target.closest ? e.target.closest('a[href]') : null;
      if (!anchor) return;

      // Ignore downloads and new-tab links.
      if (anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target === '_blank') return;

      const rawHref = anchor.getAttribute('href');
      if (!rawHref) return;

      // Ignore hash-only and javascript pseudo-links.
      if (rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return;

      let resolvedUrl;
      try {
        resolvedUrl = new URL(rawHref, window.location.href);
      } catch (_err) {
        return;
      }

      const isInternal = resolvedUrl.origin === window.location.origin;
      const normalizedInternalPath = `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      // Ignore links to the exact same URL.
      if (isInternal && normalizedInternalPath === currentPath) return;

      e.preventDefault();

      setPendingLeaveAction(
        isInternal
          ? { type: 'internal', payload: normalizedInternalPath }
          : { type: 'external', payload: resolvedUrl.toString() }
      );
      setConfirmLeaveOpen(true);
    };

    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, [isFormDirty]);

  // ===== Validation =====
  const validateField = useCallback(
    (name, value) => {
      switch (name) {
        case 'firstName':
          if (!value.trim()) return "What's your first name?";
          if (value.trim().length < 2) return 'First name must be at least 2 characters';
          return '';

        case 'lastName':
          if (!value.trim()) return "What's your last name?";
          if (value.trim().length < 2) return 'Last name must be at least 2 characters';
          return '';

  

        case 'address':
          if (!value.trim()) return "What's your street address?";
          if (value.trim().length < 5) return 'Address must be at least 5 characters';
          return '';

        case 'suburb':
          if (!value.trim()) return "What's your suburb?";
          if (value.trim().length < 2) return 'Suburb must be at least 2 characters';
          return '';

        case 'postcode':
          if (!value.trim()) return "What's your postcode?";
          if (!/^\d{4}$/.test(value)) return 'Please enter a 4-digit postcode';
          return '';

        case 'mobile':
          if (!value.trim()) return "What's your mobile number?";
          if (!/^04\d{8}$/.test(value)) return 'Enter a valid Australian mobile (04XX XXX XXX)';
          return '';

        case 'email':
          if (!value.trim()) return "What's your email address?";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Enter a valid email address';
          return '';

        case 'password':
          if (!value) return 'Create a password';
          if (value.length < 8) return 'Password must be at least 8 characters';
          if (!/(?=.*[a-z])/.test(value)) return 'Password must include at least one lowercase letter';
          if (!/(?=.*[A-Z])/.test(value)) return 'Password must include at least one uppercase letter';
          if (!/(?=.*\d)/.test(value)) return 'Password must include at least one number';
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
    },
    [formData.password]
  );

  const normalizeFieldValue = (name, value) => {
    switch (name) {
      case 'postcode':
        return onlyDigits(value).slice(0, 4);
      case 'mobile':
        return onlyDigits(value).slice(0, 10);
      case 'verificationCode':
        return onlyDigits(value).slice(0, 6);

      default:
        return value;
    }
  };

  const validateStep = useCallback(() => {
    const fieldsToValidate = stepFields[activeStep];
    let isValid = true;
    const newErrors = {};
    const touchedNow = {};

    fieldsToValidate.forEach((field) => {
      touchedNow[field] = true;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setTouched((prev) => ({ ...prev, ...touchedNow }));
    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (!isValid) {
      const firstInvalid = fieldsToValidate.find((field) => newErrors[field]);
      if (firstInvalid) {
        if (firstInvalid === 'verificationCode') {
          setTimeout(() => otpRefs.current[0]?.focus?.(), 80);
        } else if (inputRefs.current[firstInvalid]) {
          setTimeout(() => inputRefs.current[firstInvalid]?.focus?.(), 80);
        }
      }
    }

    return isValid;
  }, [activeStep, formData, validateField]);

  const handleChange = (e) => {
    const { name } = e.target;
    const normalizedValue = normalizeFieldValue(name, e.target.value);

    setFormData((prev) => ({ ...prev, [name]: normalizedValue }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, normalizedValue);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (name === 'password' && touched.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // ===== OTP Handlers =====
  const handleOtpChange = (index, raw) => {
    const digit = raw.replace(/\D/g, '').slice(-1);

    setTouched((prev) => ({ ...prev, verificationCode: true }));
    setFormData((prev) => {
      const chars = (prev.verificationCode || '').split('');
      while (chars.length < 6) chars.push('');
      chars[index] = digit;
      const code = chars.join('').slice(0, 6).replace(/\s/g, '');
      return { ...prev, verificationCode: code };
    });

    // Clear error as user types
    setErrors((prev) => ({ ...prev, verificationCode: '' }));

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus?.();
      otpRefs.current[index + 1]?.select?.();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const current = formData.verificationCode[index] || '';
      if (!current && index > 0) {
        otpRefs.current[index - 1]?.focus?.();
      } else {
        // clear current cell
        setFormData((prev) => {
          const chars = (prev.verificationCode || '').split('');
          while (chars.length < 6) chars.push('');
          chars[index] = '';
          return { ...prev, verificationCode: chars.join('').slice(0, 6) };
        });
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus?.();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus?.();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    setTouched((prev) => ({ ...prev, verificationCode: true }));
    setFormData((prev) => ({ ...prev, verificationCode: pasted }));
    setErrors((prev) => ({ ...prev, verificationCode: '' }));

    const nextIndex = Math.min(pasted.length, 5);
    setTimeout(() => otpRefs.current[nextIndex]?.focus?.(), 0);
  };

  // ===== Step Controls =====
  const handleNext = async () => {
    if (isBusy) return;
    if (!validateStep()) return;

    if (activeStep === 2) {
      await handleSubmitRegistration();
      return;
    }

    if (activeStep === 3) {
      if (codeExpiry <= 0) {
        setSnackbar({
          open: true,
          message: 'OTP expired. Please resend a new code.',
          severity: 'warning',
        });
        return;
      }
      await handleVerifyCode();
      return;
    }

    setLoading((prev) => ({ ...prev, transition: true }));
    setLoadingMessage('Loading next step...');
    setTimeout(() => {
      setActiveStep((prev) => prev + 1);
      setLoading((prev) => ({ ...prev, transition: false }));
      setLoadingMessage('');
    }, 250);
  };

  const handleBack = () => {
    if (isBusy || activeStep === 0) return;

    setLoading((prev) => ({ ...prev, transition: true }));
    setLoadingMessage('Loading previous step...');
    setTimeout(() => {
      setActiveStep((prev) => Math.max(prev - 1, 0));
      setLoading((prev) => ({ ...prev, transition: false }));
      setLoadingMessage('');
    }, 200);
  };

  // ===== API Calls =====
  const handleSubmitRegistration = async () => {
    setLoading((prev) => ({ ...prev, submit: true }));
    setLoadingMessage('Creating account and sending OTP...');

    try {
      const response = await api.post('/auth/register-init', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        address: formData.address.trim(),
        suburb: formData.suburb.trim(),
        postcode: formData.postcode.trim(),
        mobile: formData.mobile.trim(), // digits only
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data.success) {
        const resendIn = response?.data?.data?.resendAvailableIn ?? 60;
        const expiresIn = response?.data?.data?.expiresIn ?? 600;

        setResendTimer(resendIn);
        setCodeExpiry(expiresIn);
        setActiveStep(3);

        setSnackbar({
          open: true,
          message: 'OTP sent successfully. Please check your email.',
          severity: 'success',
        });

        setTimeout(() => otpRefs.current[0]?.focus?.(), 140);
      } else {
        setSnackbar({
          open: true,
          message: response?.data?.message || 'Unable to continue registration.',
          severity: 'error',
        });
      }
    } catch (error) {
      const errorData = error.response?.data;

      if (errorData?.errors) {
        const normalizedErrors = Object.entries(errorData.errors).reduce((acc, [k, v]) => {
          acc[k] = Array.isArray(v) ? v[0] : v;
          return acc;
        }, {});
        setErrors((prev) => ({ ...prev, ...normalizedErrors }));

        // Jump to earliest step containing errors
        for (let step = 0; step <= 2; step += 1) {
          const fieldsWithError = stepFields[step].filter((f) => normalizedErrors[f]);
          if (fieldsWithError.length > 0) {
            setActiveStep(step);
            setTimeout(() => inputRefs.current[fieldsWithError[0]]?.focus?.(), 120);
            break;
          }
        }
      }

      setSnackbar({
        open: true,
        message: getErrorMessage(error, 'Registration failed. Please try again.'),
        severity: 'error',
      });
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
      setLoadingMessage('');
    }
  };

  const handleVerifyCode = async () => {
    setLoading((prev) => ({ ...prev, verify: true }));
    setLoadingMessage('Verifying OTP...');

    try {
      const response = await api.post('/auth/verify', {
        email: formData.email.trim().toLowerCase(),
        code: formData.verificationCode,
      });

      if (response.data.success) {
        // Show success modal first
        setSuccessModalOpen(true);
        
        // Transition to login form after 2.5 seconds
        setTimeout(() => {
          if (onRegistrationSuccess) {
            onRegistrationSuccess(formData.email.trim().toLowerCase(), formData.password);
          } else if (onSwitchToLogin) {
            onSwitchToLogin();
          }
        }, 2500);
      } else {
        setSnackbar({
          open: true,
          message: response?.data?.message || 'OTP verification failed.',
          severity: 'error',
        });
      }
    } catch (error) {
      const errorData = error.response?.data;
      // Debug log to surface server response for 400s
      console.error('Verify API error:', errorData ?? error);

      if (errorData?.attemptsRemaining !== undefined) {
        setErrors((prev) => ({ ...prev, verificationCode: `Invalid code. ${errorData.attemptsRemaining} attempts remaining.` }));
      } else if (errorData?.message?.toLowerCase()?.includes('expired')) {
        setErrors((prev) => ({ ...prev, verificationCode: 'OTP expired. Please resend.' }));
      }

      if (errorData?.errors) {
        const normalizedErrors = Object.entries(errorData.errors).reduce((acc, [k, v]) => {
          acc[k] = Array.isArray(v) ? v[0] : v;
          return acc;
        }, {});
        setErrors((prev) => ({ ...prev, ...normalizedErrors }));
      }

      setSnackbar({
        open: true,
        message: getErrorMessage(error, 'Verification failed. Please try again.'),
        severity: 'error',
      });
    } finally {
      setLoading((prev) => ({ ...prev, verify: false }));
      setLoadingMessage('');
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || isBusy) return;

    setLoading((prev) => ({ ...prev, resend: true }));
    setLoadingMessage('Resending OTP...');

    try {
      const response = await api.post('/auth/resend-code', {
        email: formData.email.trim().toLowerCase(),
      });

      if (response.data.success) {
        const resendIn = response?.data?.data?.resendAvailableIn ?? 60;
        const expiresIn = response?.data?.data?.expiresIn ?? 600;

        setResendTimer(resendIn);
        setCodeExpiry(expiresIn);
        setFormData((prev) => ({ ...prev, verificationCode: '' }));
        setErrors((prev) => ({ ...prev, verificationCode: '' }));

        setSnackbar({
          open: true,
          message: 'New OTP sent. Check your email.',
          severity: 'success',
        });

        setTimeout(() => otpRefs.current[0]?.focus?.(), 120);
      } else {
        setSnackbar({
          open: true,
          message: response?.data?.message || 'Failed to resend OTP.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Resend API error:', error.response?.data ?? error);
      setSnackbar({
        open: true,
        message: getErrorMessage(error, 'Failed to resend OTP. Please try again.'),
        severity: 'error',
      });
    } finally {
      setLoading((prev) => ({ ...prev, resend: false }));
      setLoadingMessage('');
    }
  };

  const handleSuccessGoToLogin = () => {
    setSuccessModalOpen(false);
    // use react-router navigation rather than forcing a reload
    navigate('/auth?mode=login', { replace: true });
  };

  // ===== Renderers =====
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderPersonalDetails();
      case 1:
        return renderContactInfo();
      case 2:
        return renderAccountSecurity();
      case 3:
        return renderEmailVerification();
      default:
        return null;
    }
  };

  const renderPersonalDetails = () => (
    <Fade in timeout={250}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
          Let&apos;s start with your personal details
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <TextField
            inputRef={(el) => {
              inputRefs.current.firstName = el;
            }}
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.firstName}
            helperText={errors.firstName}
            autoComplete="given-name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutline sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyles}
          />

          <TextField
            inputRef={(el) => {
              inputRefs.current.lastName = el;
            }}
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.lastName}
            helperText={errors.lastName}
            autoComplete="family-name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutline sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyles}
          />
        </Box>


      </Box>
    </Fade>
  );

  const renderContactInfo = () => (
    <Fade in timeout={250}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
          Where can we reach you?
        </Typography>

        <TextField
          inputRef={(el) => {
            inputRefs.current.address = el;
          }}
          fullWidth
          label="Street Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.address}
          helperText={errors.address}
          autoComplete="street-address"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <HomeOutlined sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
          }}
          sx={{ ...inputStyles, mb: 3 }}
        />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <TextField
            inputRef={(el) => {
              inputRefs.current.suburb = el;
            }}
            fullWidth
            label="Suburb"
            name="suburb"
            value={formData.suburb}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.suburb}
            helperText={errors.suburb}
            autoComplete="address-level2"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnOutlined sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyles}
          />

          <TextField
            inputRef={(el) => {
              inputRefs.current.postcode = el;
            }}
            label="Postcode"
            name="postcode"
            value={formData.postcode}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.postcode}
            helperText={errors.postcode || '4-digit postcode'}
            inputProps={{
              maxLength: 4,
              inputMode: 'numeric',
              pattern: '\\d{4}',
            }}
            autoComplete="postal-code"
            sx={{ ...inputStyles, minWidth: { xs: '100%', sm: 150 } }}
          />
        </Box>

        <TextField
          inputRef={(el) => {
            inputRefs.current.mobile = el;
          }}
          fullWidth
          label="Mobile Number"
          name="mobile"
          value={formatMobile(formData.mobile)}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.mobile}
          helperText={errors.mobile || 'Australian format: 04XX XXX XXX'}
          placeholder="04XX XXX XXX"
          inputProps={{ inputMode: 'tel', maxLength: 12 }}
          autoComplete="tel"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneOutlined sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
          }}
          sx={inputStyles}
        />
      </Box>
    </Fade>
  );

  const renderAccountSecurity = () => (
    <Fade in timeout={250}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
          Secure your account
        </Typography>

        <TextField
          inputRef={(el) => {
            inputRefs.current.email = el;
          }}
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.email}
          helperText={errors.email || "We'll send an OTP to this email"}
          autoComplete="email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlined sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
          }}
          sx={{ ...inputStyles, mb: 3 }}
        />

        <TextField
          inputRef={(el) => {
            inputRefs.current.password = el;
          }}
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.password}
          helperText={errors.password || 'At least 8 characters, with uppercase, lowercase, and a number'}
          autoComplete="new-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlined sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ color: 'action.active' }}
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ ...inputStyles, mb: 3 }}
        />

        <TextField
          inputRef={(el) => {
            inputRefs.current.confirmPassword = el;
          }}
          fullWidth
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          autoComplete="new-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlined sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  sx={{ color: 'action.active' }}
                  aria-label="toggle confirm password visibility"
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

  const renderEmailVerification = () => (
    <Fade in timeout={250}>
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            width: 78,
            height: 78,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
          }}
        >
          <MarkEmailRead sx={{ fontSize: 38, color: '#fff' }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.2 }}>
          Enter the 6-digit code
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 0.5 }}>
          We sent a 6-digit code to
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 700, mb: 2.5 }}>
          {formData.email}
        </Typography>

        <Box
          onPaste={handleOtpPaste}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 1, sm: 1.25 },
            mb: 1.2,
            flexWrap: 'nowrap',
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <TextField
              key={index}
              inputRef={(el) => {
                otpRefs.current[index] = el;
              }}
              value={formData.verificationCode[index] || ''}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onFocus={(e) => e.target.select()}
              error={!!errors.verificationCode}
              inputProps={{
                maxLength: 1,
                inputMode: 'numeric',
                style: {
                  textAlign: 'center',
                  fontSize: isMobile ? '1.25rem' : '1.35rem',
                  fontWeight: 700,
                  padding: isMobile ? '10px 0' : '12px 0',
                },
              }}
              sx={{
                width: { xs: 44, sm: 52 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#fff',
                },
              }}
            />
          ))}
        </Box>

        {errors.verificationCode && (
          <Typography variant="body2" sx={{ color: 'error.main', mb: 2 }}>
            {errors.verificationCode}
          </Typography>
        )}

        <Box sx={{ mb: 2.5 }}>
          {codeExpiry > 0 ? (
            <Chip
              label={`OTP expires in ${Math.floor(codeExpiry / 60)}:${String(
                codeExpiry % 60
              ).padStart(2, '0')}`}
              size="small"
              sx={{
                backgroundColor: 'rgba(20,184,166,0.12)',
                color: '#0f766e',
                fontWeight: 700,
                mb: 1.5,
              }}
            />
          ) : (
            <Alert severity="warning" sx={{ mb: 1.5, textAlign: 'left' }}>
              OTP has expired. Please resend to get a new code.
            </Alert>
          )}

          <Button
            onClick={handleResendCode}
            disabled={resendTimer > 0 || isBusy}
            startIcon={loading.resend ? <LottieLoader size={16} /> : <Refresh />}
            sx={{
              color: '#14b8a6',
              '&:hover': { backgroundColor: 'rgba(20, 184, 166, 0.1)' },
            }}
          >
            {loading.resend
              ? 'Sending...'
              : resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : 'Resend OTP'}
          </Button>
        </Box>
      </Box>
    </Fade>
  );

  return (
    <Box>
      {/* Stepper */}
      <Box sx={{ px: { xs: 0.5, sm: 1 } }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<StyledStepConnector />}
          sx={{
            mb: 1.5,
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.72rem', sm: '0.82rem' },
              fontWeight: 500,
              mt: 1,
            },
            '& .MuiStepLabel-label.Mui-active': {
              color: '#14b8a6',
              fontWeight: 700,
            },
            '& .MuiStepLabel-label.Mui-completed': {
              color: '#14b8a6',
              fontWeight: 700,
            },
            '& .MuiStepConnector-root': {
              top: { xs: 17, sm: 20 },
              left: 'calc(-50% + 18px)',
              right: 'calc(50% + 18px)',
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={CustomStepIcon}>{!isMobile && label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {isMobile && (
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: '#14b8a6',
              fontWeight: 700,
              mb: 2,
            }}
          >
            Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
          </Typography>
        )}
      </Box>

      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={((activeStep + 1) / steps.length) * 100}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: '#e5e7eb',
          mb: 4,
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #14b8a6, #06b6d4)',
            borderRadius: 3,
          },
        }}
      />

      {/* Step Content */}
      <Box sx={{ mb: 4 }}>{renderStepContent()}</Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' } }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || isBusy}
          startIcon={<ArrowBack />}
          sx={{
            flex: { xs: 'none', sm: 1 },
            width: { xs: '100%', sm: 'auto' },
            py: 1.5,
            px: { xs: 2, sm: 3 },
            borderRadius: 999,
            fontWeight: 700,
            color: 'text.secondary',
            border: '2px solid',
            borderColor: 'divider',
            '&:hover': {
              borderColor: '#14b8a6',
              color: '#14b8a6',
            },
            '&:disabled': {
              borderColor: 'action.disabled',
              color: 'action.disabled',
            },
          }}
        >
          {loading.transition ? <LottieLoader size={14} invert /> : 'Back'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={isBusy}
          endIcon={
            loading.submit || loading.verify || loading.transition ? (
              <LottieLoader size={20} invert />
            ) : activeStep === steps.length - 1 ? (
              <Check />
            ) : (
              <ArrowForward />
            )
          }
          sx={{
            flex: { xs: 'none', sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            py: 1.5,
            borderRadius: 999,
            fontWeight: 700,
            background: 'linear-gradient(90deg, #14b8a6, #06b6d4)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(90deg, #0d9488, #0891b2)',
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)',
            },
          }}
        >
          {loading.submit
            ? 'Sending OTP...'
            : loading.verify
            ? 'Verifying OTP...'
            : activeStep === steps.length - 1
            ? 'Verify OTP'
            : 'Continue'}
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: { xs: 4, sm: 6 } }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Already have an account?{' '}
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              if (isFormDirty) {
                setPendingLeaveAction({ type: 'login' });
                setConfirmLeaveOpen(true);
                return;
              }
              if (onSwitchToLogin) onSwitchToLogin();
              else window.location.href = '/auth?mode=login';
            }}
            style={{ color: '#14b8a6', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link> 
        </Typography>
      </Box>

      {/* Terms and Privacy */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, fontSize: '0.685rem' }}>
          By creating an account, you agree to our{' '}
          <Link to="/terms" style={{ color: '#14b8a6' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" style={{ color: '#14b8a6' }}>
            Privacy Policy
          </Link>
        </Typography>
      </Box>

      {/* Global loading overlay */}
      <Backdrop
        open={isBusy}
        sx={{
          color: '#fff',
          zIndex: (t) => t.zIndex.modal + 2,
          flexDirection: 'column',
          gap: 1.5,
          backgroundColor: 'rgba(15, 23, 42, 0.35)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <LottieLoader size={96} invert />
        <Typography sx={{ fontWeight: 600 }}>{loadingMessage || 'Please wait...'}</Typography>
      </Backdrop>

      {/* Success Modal */}
      <Dialog
        open={successModalOpen}
        onClose={() => {}}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
            }}
          >
            <Celebration sx={{ color: '#fff', fontSize: 34 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Account Created Successfully
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ textAlign: 'center', pt: 0 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Your email is verified and your account is ready.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, justifyContent: 'center' }}>
          <Button
            onClick={handleSuccessGoToLogin}
            variant="contained"
            sx={{
              px: 3,
              py: 1.1,
              borderRadius: 999,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #14b8a6, #06b6d4)',
              '&:hover': {
                background: 'linear-gradient(90deg, #0d9488, #0891b2)',
              },
            }}
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Confirmation Dialog */}
      <Dialog
        open={confirmLeaveOpen}
        onClose={handleStay}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Leave this page?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. If you leave now, your entered information will be lost.
            Are you sure you want to leave?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
          <Button onClick={handleStay} sx={{ color: 'text.secondary' }}>
            Stay
          </Button>
          <Button onClick={handleLeave} variant="contained" sx={{ px: 3 }}>
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterForm;
