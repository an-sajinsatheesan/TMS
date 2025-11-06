const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email Service
 * Real implementation using Nodemailer with Gmail
 */

class EmailService {
    /**
     * Create transporter for sending emails
     */
    static createTransporter() {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    /**
     * Send OTP code email
     * @param {String} email - Recipient email
     * @param {String} code - OTP code
     */
    static async sendOtpEmail(email, code) {
        try {
            const transporter = this.createTransporter();

            const mailOptions = {
                from: process.env.EMAIL_FROM || 'TaskCRM <noreply@taskcrm.com>',
                to: email,
                subject: 'Your Verification Code - TaskCRM',
                html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
                .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; letter-spacing: 5px; margin: 20px 0; padding: 15px; background: white; border-radius: 5px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>TaskCRM Verification</h1>
                </div>
                <div class="content">
                  <h2>Your Verification Code</h2>
                  <p>Hello,</p>
                  <p>You requested a verification code for your TaskCRM account. Please use the code below:</p>
                  <div class="otp-code">${code}</div>
                  <p><strong>This code will expire in 10 minutes.</strong></p>
                  <p>If you didn't request this code, please ignore this email.</p>
                  <div class="footer">
                    <p>This is an automated email. Please do not reply.</p>
                    <p>&copy; 2025 TaskCRM. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
                text: `Your TaskCRM verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
            };

            const info = await transporter.sendMail(mailOptions);

            logger.info(`OTP email sent to ${email}: ${info.messageId}`);

            return { success: true, email, messageId: info.messageId };
        } catch (error) {
            logger.error(`Failed to send OTP email to ${email}:`, error);

            // Fallback to logger in development
            if (process.env.NODE_ENV === 'development') {
                logger.warn('========== EMAIL FALLBACK (Failed to send) ==========');
                logger.warn(`To: ${email}`);
                logger.warn(`Subject: Your Verification Code`);
                logger.warn(`Your verification code is: ${code}`);
                logger.warn(`This code will expire in 10 minutes.`);
                logger.warn('====================================================');

                // In development, return success even if email fails
                // The OTP is logged for testing
                return { success: true, email, messageId: 'dev-fallback', devMode: true };
            }

            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Send invitation email
     * @param {String} email - Recipient email
     * @param {String} tenantName - Tenant/workspace name
     * @param {String} inviterName - Name of person who sent invitation
     * @param {String} token - Invitation token
     */
    static async sendInvitationEmail(email, tenantName, inviterName, token) {
        const invitationUrl = `${process.env.CLIENT_URL}/accept-invitation/${token}`;

        try {
            const transporter = this.createTransporter();

            const mailOptions = {
                from: process.env.EMAIL_FROM || 'TaskCRM <noreply@taskcrm.com>',
                to: email,
                subject: `You've been invited to join ${tenantName}`,
                html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>You're Invited!</h2>
                <p>Hi there,</p>
                <p><strong>${inviterName}</strong> has invited you to join <strong>${tenantName}</strong> on TaskCRM.</p>
                <div style="margin: 30px 0; text-align: center;">
                  <a href="${invitationUrl}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Accept Invitation</a>
                </div>
                <p>Or copy this link: <a href="${invitationUrl}">${invitationUrl}</a></p>
                <p><small>This invitation will expire in 7 days.</small></p>
              </div>
            </body>
          </html>
        `,
                text: `${inviterName} has invited you to join ${tenantName}\n\nClick here to accept: ${invitationUrl}\n\nThis invitation will expire in 7 days.`,
            };

            const info = await transporter.sendMail(mailOptions);
            logger.info(`Invitation email sent to ${email} for tenant ${tenantName}`);

            return { success: true, email, invitationUrl, messageId: info.messageId };
        } catch (error) {
            logger.error(`Failed to send invitation email to ${email}:`, error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Send welcome email
     * @param {String} email - Recipient email
     * @param {String} name - User name
     */
    static async sendWelcomeEmail(email, name) {
        try {
            const transporter = this.createTransporter();

            const mailOptions = {
                from: process.env.EMAIL_FROM || 'TaskCRM <noreply@taskcrm.com>',
                to: email,
                subject: 'Welcome to TaskCRM!',
                html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Welcome to TaskCRM, ${name}!</h2>
                <p>We're excited to have you on board.</p>
                <p>Get started by exploring our features and managing your tasks efficiently.</p>
                <div style="margin: 30px 0; text-align: center;">
                  <a href="${process.env.CLIENT_URL}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
                </div>
              </div>
            </body>
          </html>
        `,
                text: `Welcome to TaskCRM, ${name}!\n\nWe're excited to have you on board.`,
            };

            const info = await transporter.sendMail(mailOptions);
            logger.info(`Welcome email sent to ${email}`);

            return { success: true, email, messageId: info.messageId };
        } catch (error) {
            logger.error(`Failed to send welcome email to ${email}:`, error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Send password reset email
     * @param {String} email - Recipient email
     * @param {String} resetToken - Password reset token
     */
    static async sendPasswordResetEmail(email, resetToken) {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        try {
            const transporter = this.createTransporter();

            const mailOptions = {
                from: process.env.EMAIL_FROM || 'TaskCRM <noreply@taskcrm.com>',
                to: email,
                subject: 'Password Reset Request - TaskCRM',
                html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>You requested a password reset for your TaskCRM account.</p>
                <div style="margin: 30px 0; text-align: center;">
                  <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                </div>
                <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this, please ignore this email.</p>
              </div>
            </body>
          </html>
        `,
                text: `You requested a password reset.\n\nClick here to reset: ${resetUrl}\n\nThis link will expire in 1 hour.`,
            };

            const info = await transporter.sendMail(mailOptions);
            logger.info(`Password reset email sent to ${email}`);

            return { success: true, email, resetUrl, messageId: info.messageId };
        } catch (error) {
            logger.error(`Failed to send password reset email to ${email}:`, error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}

module.exports = EmailService;
