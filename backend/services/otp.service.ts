const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

/**
 * OTP Service
 * Handles OTP generation, verification, and management
 */

class OtpService {
  /**
   * Generate a 6-digit OTP code
   * @returns {String} 6-digit OTP code
   */
  static generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create and store OTP for email
   * @param {String} email - User email
   * @returns {Object} OTP record
   */
  static async createOtp(email) {
    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unverified OTPs for this email
    await prisma.otpCode.deleteMany({
      where: {
        email,
        isVerified: false,
      },
    });

    // Create new OTP
    const otp = await prisma.otpCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    return otp;
  }

  /**
   * Verify OTP code
   * @param {String} email - User email
   * @param {String} code - OTP code to verify
   * @returns {Boolean} True if valid, throws error otherwise
   */
  static async verifyOtp(email, code) {
    const otp = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        isVerified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      throw ApiError.badRequest('Invalid OTP code');
    }

    if (new Date() > otp.expiresAt) {
      throw ApiError.badRequest('OTP code has expired');
    }

    // Mark as verified
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { isVerified: true },
    });

    return true;
  }

  /**
   * Clean up expired OTPs (can be run as a cron job)
   */
  static async cleanupExpiredOtps() {
    const result = await prisma.otpCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}

module.exports = OtpService;
