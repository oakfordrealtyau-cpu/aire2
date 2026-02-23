import { z } from 'zod';

// Australian mobile regex: 04xxxxxxxx or +614xxxxxxxx
const auMobileRegex = /^(\+61|0)4\d{8}$/;

// Australian postcode regex: 4 digits
const auPostcodeRegex = /^\d{4}$/;

// ===== Step 1: Personal Info Schema =====
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name is too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name is too long'),

});

// ===== Step 2: Address Info Schema =====
export const addressInfoSchema = z.object({
  address: z
    .string()
    .min(1, 'Street address is required')
    .max(255, 'Address is too long'),
  suburb: z
    .string()
    .min(1, 'Suburb is required')
    .max(100, 'Suburb name is too long'),
  postcode: z
    .string()
    .min(1, 'Postcode is required')
    .regex(auPostcodeRegex, 'Australian postcode must be 4 digits'),
});

// ===== Step 3: Contact & Security Schema =====
export const contactSecuritySchema = z.object({
  mobile: z
    .string()
    .min(1, 'Mobile number is required')
    .transform(val => val.replace(/\s/g, ''))
    .refine(val => auMobileRegex.test(val), {
      message: 'Enter a valid Australian mobile (04xxxxxxxx)',
    }),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .transform(val => val.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ===== Step 4: Verification Schema =====
export const verificationSchema = z.object({
  verificationCode: z
    .string()
    .min(1, 'Verification code is required')
    .length(6, 'Enter a 6-digit code')
    .regex(/^\d{6}$/, 'Enter a 6-digit code'),
});

// ===== Full Registration Schema =====
export const fullRegistrationSchema = z.object({
  firstName: personalInfoSchema.shape.firstName,
  lastName: personalInfoSchema.shape.lastName,

  address: addressInfoSchema.shape.address,
  suburb: addressInfoSchema.shape.suburb,
  postcode: addressInfoSchema.shape.postcode,
  mobile: z.string().min(1, 'Mobile number is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: contactSecuritySchema._def.schema.shape.password,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => {
  const cleanMobile = data.mobile.replace(/\s/g, '');
  return auMobileRegex.test(cleanMobile);
}, {
  message: 'Enter a valid Australian mobile (04xxxxxxxx)',
  path: ['mobile'],
});

// ===== Helper Functions =====


export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '#e5e7eb' };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const configs = {
    1: { label: 'Very Weak', color: '#ef4444' },
    2: { label: 'Weak', color: '#f97316' },
    3: { label: 'Fair', color: '#f59e0b' },
    4: { label: 'Good', color: '#84cc16' },
    5: { label: 'Strong', color: '#10b981' },
  };

  return {
    score,
    percentage: (score / 5) * 100,
    ...configs[score] || { label: '', color: '#e5e7eb' }
  };
};
