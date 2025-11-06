const JwtService = require('../services/jwt.service');
const AuthService = require('../services/auth.service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */

const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from header
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = JwtService.verifyToken(token);

    // Get user from database
    const user = await AuthService.getUserById(decoded.id);

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired token');
  }
});

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is provided, but doesn't throw error if not
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = JwtService.verifyToken(token);
      const user = await AuthService.getUserById(decoded.id);
      req.user = user;
    } catch (error) {
      // Silently fail - user will be undefined
    }
  }

  next();
});

module.exports = { authenticate, optionalAuth };
