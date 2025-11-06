const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * JWT Service
 * Handles JWT token generation and verification
 */

class JwtService {
  /**
   * Generate JWT token
   * @param {Object} payload - Data to encode in token
   * @param {String} expiresIn - Token expiration time
   * @returns {String} JWT token
   */
  static generateToken(payload, expiresIn = JWT_EXPIRE) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn,
    });
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token to verify
   * @returns {Object} Decoded payload
   * @throws {ApiError} If token is invalid or expired
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw ApiError.unauthorized('Invalid token');
      }
      throw ApiError.unauthorized('Token verification failed');
    }
  }

  /**
   * Generate access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Access and refresh tokens
   */
  static generateAuthTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
    };

    const accessToken = this.generateToken(payload, JWT_EXPIRE);
    const refreshToken = this.generateToken(payload, '90d');

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Decode token without verification (for debugging)
   * @param {String} token - JWT token
   * @returns {Object} Decoded payload
   */
  static decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = JwtService;
