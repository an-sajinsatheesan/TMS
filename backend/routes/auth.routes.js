const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const authValidators = require('../validators/auth.validator');

/**
 * Auth Routes
 * Base path: /api/v1/auth
 */

// POST /register - Register with email (send OTP)
router.post('/register', validate(authValidators.register), AuthController.register);

// POST /verify-otp - Verify OTP and get JWT token
router.post('/verify-otp', validate(authValidators.verifyOtp), AuthController.verifyOtp);

// POST /google - Login with Google OAuth
router.post('/google', validate(authValidators.googleLogin), AuthController.googleLogin);

// POST /login - Login with email and password
router.post('/login', validate(authValidators.login), AuthController.login);

// POST /forgot-password - Request password reset
router.post('/forgot-password', validate(authValidators.forgotPassword), AuthController.forgotPassword);

// POST /reset-password - Reset password with token
router.post('/reset-password', validate(authValidators.resetPassword), AuthController.resetPassword);

// GET /me - Get current user (protected)
router.get('/me', authenticate, AuthController.getMe);

// GET /onboarding-status - Get onboarding status (protected)
router.get('/onboarding-status', authenticate, AuthController.getOnboardingStatus);

// POST /refresh-token - Refresh access token
router.post('/refresh-token', validate(authValidators.refreshToken), AuthController.refreshToken);

module.exports = router;
