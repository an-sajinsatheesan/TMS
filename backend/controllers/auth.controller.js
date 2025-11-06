const AuthService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

class AuthController {
  /**
   * @route   POST /api/v1/auth/register
   * @desc    Register with email (send OTP)
   * @access  Public
   */
  static register = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await AuthService.registerWithEmail(email);

    ApiResponse.success(result, 'OTP sent successfully').send(res);
  });

  /**
   * @route   POST /api/v1/auth/verify-otp
   * @desc    Verify OTP and get JWT token
   * @access  Public
   */
  static verifyOtp = asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    const result = await AuthService.verifyOtp(email, code);

    ApiResponse.success(result, 'Email verified successfully').send(res);
  });

  /**
   * @route   POST /api/v1/auth/google
   * @desc    Login with Google OAuth
   * @access  Public
   */
  static googleLogin = asyncHandler(async (req, res) => {
    const { googleToken } = req.body;

    const result = await AuthService.loginWithGoogle(googleToken);

    ApiResponse.success(result, 'Google login successful').send(res);
  });

  /**
   * @route   POST /api/v1/auth/login
   * @desc    Login with email and password
   * @access  Public
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await AuthService.loginWithPassword(email, password);

    ApiResponse.success(result, 'Login successful').send(res);
  });

  /**
   * @route   GET /api/v1/auth/me
   * @desc    Get current user
   * @access  Private
   */
  static getMe = asyncHandler(async (req, res) => {
    const user = req.user;

    ApiResponse.success({ user }, 'User retrieved successfully').send(res);
  });

  /**
   * @route   POST /api/v1/auth/forgot-password
   * @desc    Request password reset
   * @access  Public
   */
  static forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await AuthService.requestPasswordReset(email);

    ApiResponse.success(result, result.message).send(res);
  });

  /**
   * @route   POST /api/v1/auth/reset-password
   * @desc    Reset password with token
   * @access  Public
   */
  static resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    const result = await AuthService.resetPassword(token, newPassword);

    ApiResponse.success(result, result.message).send(res);
  });

  /**
   * @route   GET /api/v1/auth/onboarding-status
   * @desc    Get onboarding status for current user
   * @access  Private
   */
  static getOnboardingStatus = asyncHandler(async (req, res) => {
    const result = await AuthService.getUserWithOnboardingStatus(req.user.id);

    ApiResponse.success(result, 'Onboarding status retrieved').send(res);
  });

  /**
   * @route   POST /api/v1/auth/refresh-token
   * @desc    Refresh access token using refresh token
   * @access  Public
   */
  static refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await AuthService.refreshAccessToken(refreshToken);

    ApiResponse.success(result, 'Token refreshed successfully').send(res);
  });
}

module.exports = AuthController;
