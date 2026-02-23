import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Stepper,
  Step,
  StepLabel,
  Divider,
  CircularProgress,
  Skeleton,
  Stack,
  LinearProgress,
  Alert,
} from "@mui/material";

import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// lottie animations were removed – file wasn’t present

import api from "../../services/api";

const RequirementItem = ({ met, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: met ? 'rgba(22, 163, 74, 0.1)' : 'rgba(226, 232, 240, 1)',
        border: met ? '2px solid #16a34a' : '2px solid #cbd5e1',
        flexShrink: 0,
      }}
    >
      {met && (
        <Typography sx={{ color: '#16a34a', fontWeight: 'bold', fontSize: '0.9rem' }}>✓</Typography>
      )}
    </Box>
    <Typography 
      variant="caption" 
      sx={{ 
        color: met ? '#16a34a' : '#94a3b8',
        fontWeight: met ? 600 : 500,
        fontSize: '0.85rem'
      }}
    >
      {label}
    </Typography>
  </Box>
);

const LoginForm = ({ onLoginSuccess, onSwitchToRegister, registrationData }) => {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ 
    email: registrationData?.email || "", 
    password: registrationData?.password || "" 
  });
  const [errors, setErrors] = useState({});
  const [successReset , setSuccessReset] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const resetEmailRef = useRef(null);
  const resetCodeRef = useRef(null);
  const resetNewPasswordRef = useRef(null);
  const resetConfirmPasswordRef = useRef(null);

  // OTP refs for reset code inputs
  const otpRefs = useRef(Array.from({ length: 6 }, () => null));

  const [openReset, setOpenReset] = useState(false);
  const [resetStep, setResetStep] = useState(0);
  const [showResetPassword, setShowResetPassword] = useState(false);
  // SUCCESS MODAL STATES
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginSuccessModal, setShowLoginSuccessModal] = useState(false);
  const [loginSuccessData, setLoginSuccessData] = useState(null);

  // Password validation state for reset
  const [resetPasswordStrength, setResetPasswordStrength] = useState({
    hasMinLength: false,      // 8+ characters
    hasUpperCase: false,       // At least one uppercase letter
    hasNumber: false,          // At least one number
    hasSpecialChar: false,     // At least one special character
  });

  const [resetForm, setResetForm] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetErrors, setResetErrors] = useState({});
  const [resetLoading, setResetLoading] = useState(false);

  const fieldRounding = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.8)",
    transition: "all 0.3s ease",
    "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
    "&.Mui-focused": {
      backgroundColor: "#fff",
      boxShadow: "0 0 0 4px rgba(20, 184, 166, 0.1)",
    },
  },
};

  const isEmailValid = (email) => {
    if (!email) return false;
    const cleanEmail = email.trim();
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(cleanEmail).toLowerCase());
  };
  // Password validation function for reset
  const validateResetPassword = (password) => {
    const strength = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password),
    };
    setResetPasswordStrength(strength);
    return Object.values(strength).every(val => val === true);
  };

  const isResetPasswordValid = Object.values(resetPasswordStrength).every(val => val === true);
  const navigate = useNavigate();

  const validate = () => {
    const err = {};
    let firstErrorField = null;

    if (!form.email?.trim()) {
      err.email = "Please enter your email.";
      if (!firstErrorField) firstErrorField = emailRef;
    } else if (!isEmailValid(form.email)) {
      err.email = "Please enter a valid email address.";
      if (!firstErrorField) firstErrorField = emailRef;
    }

    if (!form.password?.trim()) {
      err.password = "Please enter your password.";
      if (!firstErrorField) firstErrorField = passwordRef;
    }

    setErrors(err);
    if (firstErrorField) {
      if (firstErrorField.current?.focus) {
        firstErrorField.current.focus();
      }
    }
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoginLoading(true);

    try {
      // TEMPORARY: Bypass API call and show modal directly
      // const res = await api.post(`/auth/login`, {
      //   ...form,
      //   email: form.email.trim(),
      // });
      // if (res.data.token) {
      //   localStorage.setItem("token", res.data.token);
      // }
      // // we know the server just sent a refresh cookie, so mark it locally
      // try { localStorage.setItem('hasRefreshCookie', '1'); } catch (e) {}
      // // Store user data immediately for faster session validation
      // let normalizedUser = null;
      // if (res.data.user) {
      //   normalizedUser = {
      //     id: res.data.user.id,
      //     email: res.data.user.email,
      //     role_id: Number(res.data.user.role_id),
      //     firstname: res.data.user.firstname,
      //     lastname: res.data.user.lastname,
      //     // normalize roles to lowercase strings for consistent checks
      //     roles: Array.isArray(res.data.user.roles)
      //       ? res.data.user.roles.map(r => (typeof r === 'string' ? r.toLowerCase() : r))
      //       : [],
      //     role: res.data.user.role ? String(res.data.user.role).toLowerCase() : null,
      //   };
      //   localStorage.setItem("user", JSON.stringify(normalizedUser));
      // }
      // if (normalizedUser) {
      //   setUser(normalizedUser);
      // }
      // Show success modal before redirect
      const mockUser = {
        firstname: form.email.split('@')[0],
        email: form.email,
      };
      setLoginSuccessData(mockUser);
      setShowLoginSuccessModal(true);
    } catch (err) {
      console.error('LoginForm submit error', err);
      // if it's an axios error we'll have response property
      if (!err.response) {
        // non-axios error (JS runtime) or network issue
        setErrors({ general: err.message || 'Login error. Please try again.' });
      } else {
        const data = err.response?.data || {};
        const message = data.error || data.message;
        if (err.response?.status === 401) {
          setErrors({ password: message || "Incorrect credentials" });
          setForm((prev) => ({ ...prev, password: "" }));
          passwordRef.current?.focus();
        } else {
          setErrors({ general: message || "Login failed. Please try again." });
        }
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleOpenReset = () => {
    setResetForm({
      email: form.email || "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    });
    setResetStep(0);
    setResetErrors({});
    setShowResetPassword(false);
    setOpenReset(true);
  };

  const handleVerifyAccount = async () => {
    const err = {};
    if (!isEmailValid(resetForm.email)) {
      err.email = "Valid email is required.";
      setResetErrors(err);
      resetEmailRef.current?.focus();
      return;
    }

    setResetLoading(true);
    setResetErrors({});

    try {
      await api.post(`/forgot-password`, {
        email: resetForm.email.trim(),
      });
      setResetStep(1);
      // focus the first OTP input when we move to step 1
      setTimeout(() => otpRefs.current[0]?.focus?.(), 300);
    } catch (err) {
      setResetErrors({
        general: err.response?.data?.error || "Account not found.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!resetForm.code) {
      setResetErrors({ code: "Verification code is required." });
      // focus the first OTP input
      otpRefs.current[0]?.focus?.();
      return;
    }

    setResetLoading(true);
    setResetErrors({});
    try {
      await api.post(`/verify-code`, {
        email: resetForm.email.trim(),
        code: resetForm.code,
      });
      setResetStep(2);
    } catch (err) {
      setResetErrors({ 
        code: err.response?.data?.error || "Invalid code. Please try again.",
        general: "Verification failed." 
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetSubmit = async () => {
    const { code, newPassword, confirmPassword, email } = resetForm;
    const err = {};
    let firstErrorField = null;

    if (!isResetPasswordValid) {
      err.newPassword = "Password must meet all requirements";
      firstErrorField = resetNewPasswordRef;
    } else if (newPassword !== confirmPassword) {
      err.confirmPassword = "Passwords do not match";
      if (!firstErrorField) firstErrorField = resetConfirmPasswordRef;
    }

    if (Object.keys(err).length > 0) {
      setResetErrors(err);
      firstErrorField.current?.focus();
      return;
    }

    setResetLoading(true);
    try {
      await api.post(`/reset-password`, {
        email: email.trim(),
        code,
        newPassword,
      });
      setOpenReset(false);
      setShowSuccessModal(true);
      setSuccessReset("Password reset successful! Please log in.");
    } catch (err) {
      setResetErrors({ general: err.response?.data?.error || "Reset failed." });
    } finally {
      setResetLoading(false);
    }
  };

  // OTP handlers for reset code entry
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const arr = Array.from({ length: 6 }, (_, i) => resetForm.code[i] || "");
    arr[index] = value.slice(-1);
    const codeString = arr.join("");
    setResetForm((prev) => ({ ...prev, code: codeString }));
    setResetErrors((prev) => ({ ...prev, code: "" }));
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus?.();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !(resetForm.code && resetForm.code[index]) && index > 0) {
      otpRefs.current[index - 1]?.focus?.();
    }
  };

  // Reset form state when component mounts or when switching back to login tab
  useEffect(() => {
    setForm({ email: "", password: "" });
    setErrors({});
    setShowPassword(false);
    setLoginLoading(false);
  }, []);

  // Auto-fill form with registration data if available
  useEffect(() => {
    if (registrationData?.email && registrationData?.password) {
      setForm({ 
        email: registrationData.email, 
        password: registrationData.password 
      });
      setErrors({});
    }
  }, [registrationData]);

  useEffect(() => {
    if (resetStep === 1) {
      setTimeout(() => otpRefs.current[0]?.focus?.(), 300);
    }
  }, [resetStep, openReset]);

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        display="flex"
        flexDirection="column"
        gap={3.5}
        sx={{ maxWidth: 530, mx: "auto" }}
      >
          {errors.general && (
            <Typography
              variant="body2"
              color="error"
              textAlign="center"
              sx={{
                bgcolor: "#fff1f2",
                p: 2.5,
                borderRadius: "20px",
                border: "1px solid #ffe4e6",
                fontWeight: 600,
                color: "#e11d48"
              }}
            >
              {errors.general}
            </Typography>
          )}
          

          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            inputRef={emailRef}
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            error={!!errors.email}
            helperText={errors.email}
            sx={fieldRounding}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon
                    sx={{ fontSize: 22, color: "primary.main", ml: 1 }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <Box>
            <TextField
              fullWidth
              label="Password"
              inputRef={passwordRef}
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              error={!!errors.password}
              helperText={errors.password}
              sx={fieldRounding}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon
                      sx={{ fontSize: 22, color: "primary.main", ml: 1 }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      {!showPassword ? (
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box textAlign="right" mt={1.5}>
              <Link
                component="button"
                variant="caption"
                onClick={handleOpenReset}
                type="button"
                disabled
                sx={{ 
                  opacity: 0.5,
                  fontSize: 13, 
                  textDecoration: "none", 
                  color: "primary.main",
                  "&:hover": { textDecoration: "underline" }
                }}
              >
                Forgot password?
              </Link>
            </Box>
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loginLoading}
            sx={{ 
              mt: -1.5,
              borderRadius: "20px", 
              textTransform: "none",
            }}
          >
            {loginLoading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </Button>

          {/* link to switch to register */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Don't have an account?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => onSwitchToRegister && onSwitchToRegister()}
                sx={{ textDecoration: 'none', fontWeight: 600 }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>

      {/* RESET PASSWORD DIALOG */}
      <Dialog
        open={openReset}
        onClose={() => !resetLoading && setOpenReset(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 8, p: 2, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } }}
      >
        <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
          <Typography variant="h5" color="#0f172a" fontWeight="800">
            Recover Access
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stepper
            activeStep={resetStep}
            alternativeLabel
            sx={{ mb: 5, mt: 2 }}
          >
            <Step><StepLabel>Identity</StepLabel></Step>
            <Step><StepLabel>Security</StepLabel></Step>
            <Step><StepLabel>New Pass</StepLabel></Step>
          </Stepper>

          {resetErrors.general && (
            <Typography
              color="error"
              variant="caption"
              display="block"
              mb={3}
              sx={{
                bgcolor: "#fff1f2",
                p: 2,
                borderRadius: "16px",
                textAlign: "center",
                fontWeight: 600,
                border: "1px solid #ffe4e6"
              }}
            >
              {resetErrors.general}
            </Typography>
          )}

          {resetStep === 0 && (
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                label="Registered Email"
                inputRef={resetEmailRef}
                value={resetForm.email}
                onChange={(e) =>
                  setResetForm((prev) => ({ ...prev, email: e.target.value }))
                }
                error={!!resetErrors.email}
                helperText={resetErrors.email}
                fullWidth
                sx={fieldRounding}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon
                        sx={{ fontSize: 22, color: "primary.main", ml: 1 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {resetStep === 1 && (
            <Box display="flex" flexDirection="column" gap={3}>
              <Box textAlign="center" color="success.main" mb={1}>
                <MarkEmailReadOutlinedIcon sx={{ fontSize: 56, color: 'success.main' }} />
                <Typography variant="h6" fontWeight="800" mt={2}>
                  Verification Sent
                </Typography>
                <Typography variant="body2" color="#475569">
                  Check <strong>{resetForm.email}</strong> for your reset code.
                </Typography>
              </Box>

              {/* OTP inputs (6 separate boxes) */}
              <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 1 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TextField
                    key={i}
                    inputRef={(el) => (otpRefs.current[i] = el)}
                    value={resetForm.code[i] || ''}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    error={!!resetErrors.code}
                    variant="outlined"
                    inputProps={{
                      maxLength: 1,
                      style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', padding: '12px 0', width: '42px' }
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        backgroundColor: resetForm.code[i] ? "rgba(25, 118, 210, 0.05)" : "#f8fafc",
                        "& fieldset": { borderColor: resetForm.code[i] ? "primary.main" : "#e2e8f0", borderWidth: resetForm.code[i] ? "2px" : "1px" },
                        "&.Mui-focused fieldset": { boxShadow: "0 0 0 4px rgba(25, 118, 210, 0.1)" }
                      }
                    }}
                  />
                ))}
              </Stack>

              {resetErrors.code && <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2, fontWeight: 700, textAlign: "center" }}>{resetErrors.code}</Typography>}

            </Box>
          )}

          {resetStep === 2 && (
            <Box display="flex" flexDirection="column" gap={3}>
              <Box>
                <TextField
                  label="New Password"
                  inputRef={resetNewPasswordRef}
                  type={showResetPassword ? "text" : "password"}
                  value={resetForm.newPassword}
                  onChange={(e) => {
                    setResetForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }));
                    validateResetPassword(e.target.value);
                  }}
                  error={!!resetErrors.newPassword || (resetForm.newPassword.length > 0 && !isResetPasswordValid)}
                  helperText={resetErrors.newPassword}
                  fullWidth
                  sx={fieldRounding}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{ fontSize: 22, color: "primary.main", ml: 1 }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowResetPassword((v) => !v)}
                          edge="end"
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          {!showResetPassword ? (
                            <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />
                          ) : (
                            <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Live Password Strength Indicator */}
                {resetForm.newPassword.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                        Password Strength
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 700,
                          color: isResetPasswordValid ? '#16a34a' : '#f97316'
                        }}
                      >
                        {isResetPasswordValid ? '✓ Strong' : 'Build strength'}
                      </Typography>
                    </Box>
                    
                    {/* Progress bar showing overall strength */}
                    <LinearProgress 
                      variant="determinate" 
                      value={(Object.values(resetPasswordStrength).filter(v => v).length / 4) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          backgroundColor: isResetPasswordValid ? '#16a34a' : Object.values(resetPasswordStrength).filter(v => v).length >= 3 ? '#f97316' : '#ec4899'
                        }
                      }}
                    />
                    
                    {/* Individual requirement checklist */}
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      <RequirementItem 
                        met={resetPasswordStrength.hasMinLength} 
                        label="At least 8 characters" 
                      />
                      <RequirementItem 
                        met={resetPasswordStrength.hasUpperCase} 
                        label="One uppercase letter (A-Z)" 
                      />
                      <RequirementItem 
                        met={resetPasswordStrength.hasNumber} 
                        label="One number (0-9)" 
                      />
                      <RequirementItem 
                        met={resetPasswordStrength.hasSpecialChar} 
                        label="One special character (!@#$%^&*)" 
                      />
                    </Stack>
                  </Box>
                )}
              </Box>

              <Box>
                <TextField
                  label="Confirm New Password"
                  inputRef={resetConfirmPasswordRef}
                  type={showResetPassword ? "text" : "password"}
                  value={resetForm.confirmPassword}
                  onChange={(e) =>
                    setResetForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  error={!!resetErrors.confirmPassword}
                  helperText={resetErrors.confirmPassword}
                  fullWidth
                  sx={fieldRounding}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{ fontSize: 22, color: "primary.main", ml: 1 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 4, pt: 1, justifyContent: "space-between" }}>
          <Button
            onClick={() => {
                if(resetStep > 0) setResetStep(resetStep - 1);
                else setOpenReset(false);
            }}
            disabled={resetLoading}
            sx={{ textTransform: "none", borderRadius: "14px", color: '#64748b' }}
          >
            {resetStep === 0 ? "Go Back" : "Previous"}
          </Button>

          {resetStep === 0 && (
            <Button
              variant="contained"
              onClick={handleVerifyAccount}
              disabled={resetLoading}
              sx={{ px: 4, borderRadius: "18px", textTransform: "none", py: 1.2 }}
            >
              {resetLoading ? <CircularProgress size={20} color="inherit" /> : "Verify"}
            </Button>
          )}

          {resetStep === 1 && (
            <Button
              variant="contained"
              onClick={handleVerifyCode}
              disabled={resetLoading}
              sx={{ px: 4, borderRadius: "18px", textTransform: "none", py: 1.2 }}
            >
              {resetLoading ? <CircularProgress size={20} color="inherit" /> : "Verify Code"}
            </Button>
          )}

          {resetStep === 2 && (
            <Button
              variant="contained"
              onClick={handleResetSubmit}
              disabled={resetLoading}
              sx={{ px: 4, borderRadius: 25, textTransform: "none", py: 1 }}
            >
              {resetLoading ? <CircularProgress size={20} color="inherit" /> : "Save Password"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 8, 
            p: 3, 
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
          } 
        }}
      >
        <DialogContent sx={{ pt: 4 }}>
          <Typography variant="h5" fontWeight="800" color="#0f172a" gutterBottom>
            All Set!
          </Typography>
          <Typography variant="body1" color="#64748b" sx={{ mb: 4 }}>
            Your password has been successfully reset. You can now use your new password to access your account.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            onClick={() => setShowSuccessModal(false)}
            sx={{ 
              borderRadius: "20px", 
              py: 1.5, 
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
            }}
          >
            Back to Login
          </Button>
        </DialogContent>
      </Dialog>

      {/* LOGIN SUCCESS MODAL */}
      <Dialog
        open={showLoginSuccessModal}
        onClose={() => {}}
        maxWidth="xs"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 8, 
            p: 3, 
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
          } 
        }}
      >
        <DialogContent sx={{ pt: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Typography sx={{ color: '#fff', fontSize: 32 }}>🚀</Typography>
          </Box>
          <Typography variant="h5" fontWeight="800" color="#0f172a" gutterBottom>
            Currently Working on It
          </Typography>
          <Typography variant="body1" color="#64748b" sx={{ mb: 3 }}>
            Thanks for your interest! We're actively developing the platform and will have it ready soon. Stay tuned for updates!
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ⚙️ Platform Under Development
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
              Full access will be available shortly. Check back soon!
            </Typography>
          </Alert>

          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              setShowLoginSuccessModal(false);
              setForm({ email: "", password: "" });
            }}
            sx={{ 
              borderRadius: "20px", 
              py: 1.5, 
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.3)',
              background: 'linear-gradient(90deg, #f97316, #f59e0b)',
              '&:hover': {
                background: 'linear-gradient(90deg, #ea580c, #d97706)'
              }
            }}
          >
            Go Back to Login
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginForm;