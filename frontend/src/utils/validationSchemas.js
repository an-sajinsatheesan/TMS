import * as yup from 'yup';

// Login validation schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
});

// Register validation schema
export const registerSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address')
});

// Verify OTP validation schema
export const verifyOtpSchema = yup.object().shape({
  code: yup
    .string()
    .required('Verification code is required')
    .matches(/^[0-9]{6}$/, 'Code must be 6 digits')
});

// Profile setup validation schema
export const profileSchema = yup.object().shape({
  fullName: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
  avatarUrl: yup
    .string()
    .url('Please enter a valid URL')
    .nullable()
    .transform((value) => value || null)
});

// Project name validation schema
export const projectNameSchema = yup.object().shape({
  projectName: yup
    .string()
    .required('Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must not exceed 100 characters')
});

// Forgot password validation schema
export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address')
});

// Reset password validation schema
export const resetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
});
