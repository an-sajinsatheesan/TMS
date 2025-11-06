const Joi = require('joi');

/**
 * Auth Validators
 * Joi schemas for authentication endpoints
 */

const authValidators = {
  // POST /register
  register: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    }),
  },

  // POST /verify-otp
  verifyOtp: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
      code: Joi.string().length(6).pattern(/^\d+$/).required().messages({
        'string.length': 'OTP code must be 6 digits',
        'string.pattern.base': 'OTP code must contain only numbers',
        'any.required': 'OTP code is required',
      }),
    }),
  },

  // POST /google
  googleLogin: {
    body: Joi.object({
      googleToken: Joi.string().required().messages({
        'any.required': 'Google token is required',
      }),
    }),
  },

  // POST /login
  login: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
      }),
    }),
  },

  // POST /forgot-password
  forgotPassword: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    }),
  },

  // POST /reset-password
  resetPassword: {
    body: Joi.object({
      token: Joi.string().required().messages({
        'any.required': 'Reset token is required',
      }),
      newPassword: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'New password is required',
      }),
    }),
  },
};

module.exports = authValidators;
