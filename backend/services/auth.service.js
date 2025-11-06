const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const JwtService = require("./jwt.service");
const OtpService = require("./otp.service");
const EmailService = require("./email.service");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Authentication Service
 * Handles user authentication, registration, and related operations
 */

class AuthService {
    /**
     * Register user with email (send OTP)
     * @param {String} email - User email
     * @returns {Object} Success message
     */
    static async registerWithEmail(email) {
        // Check if user already exists and is verified
        const existingUser = await prisma.user.findUnique({
            where: { email },
            include: { onboardingData: true },
        });

        if (existingUser && existingUser.isEmailVerified) {
            // Check if onboarding is incomplete and user has no password
            if (
                existingUser.onboardingData &&
                !existingUser.onboardingData.completedAt &&
                !existingUser.passwordHash
            ) {
                // Allow user to continue onboarding without re-verifying email
                // Generate tokens for the user to continue
                const tokens = JwtService.generateAuthTokens(existingUser);
                return {
                    userExists: true,
                    isEmailVerified: true,
                    onboardingComplete: false,
                    currentStep: existingUser.onboardingData.currentStep || 1,
                    canContinueOnboarding: true,
                    user: {
                        id: existingUser.id,
                        email: existingUser.email,
                        fullName: existingUser.fullName,
                        avatarUrl: existingUser.avatarUrl,
                        isEmailVerified: existingUser.isEmailVerified,
                    },
                    tokens,
                    message:
                        "Welcome back! Continue setting up your account.",
                };
            }
            // Check if onboarding is incomplete but user has password
            if (
                existingUser.onboardingData &&
                !existingUser.onboardingData.completedAt &&
                existingUser.passwordHash
            ) {
                return {
                    userExists: true,
                    isEmailVerified: true,
                    onboardingComplete: false,
                    currentStep: existingUser.onboardingData.currentStep || 1,
                    message:
                        "This email is already registered. Please log in to continue your setup.",
                };
            }
            return {
                userExists: true,
                isEmailVerified: true,
                onboardingComplete: true,
                message: "User already exists. Please login.",
            };
        }

        // Generate and send OTP
        const otp = await OtpService.createOtp(email);
        await EmailService.sendOtpEmail(email, otp.code);

        // Create or update user record (unverified)
        if (!existingUser) {
            await prisma.user.create({
                data: {
                    email,
                    authProvider: "EMAIL",
                    isEmailVerified: false,
                },
            });
        }

        return {
            userExists: false,
            message: "OTP sent to your email",
            email,
        };
    }

    /**
     * Verify OTP (email verification only - NO token generation)
     * Token will be generated AFTER account creation with password
     * @param {String} email - User email
     * @param {String} code - OTP code
     * @returns {Object} User email verification status
     */
    static async verifyOtp(email, code) {
        // Verify OTP
        await OtpService.verifyOtp(email, code);

        // Update user as verified (but DON'T generate token yet)
        const user = await prisma.user.update({
            where: { email },
            data: { isEmailVerified: true },
        });

        // DON'T generate tokens here - user hasn't set password yet!
        // DON'T create onboarding data yet - account not fully created!

        return {
            success: true,
            message: "Email verified successfully. Please complete your registration.",
            user: {
                id: user.id,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
            },
            // NO tokens returned - they'll be generated after password is set
        };
    }

    /**
     * Login with Google OAuth
     * @param {String} googleToken - Google OAuth token
     * @returns {Object} User and tokens
     */
    static async loginWithGoogle(googleToken) {
        try {
            // Verify Google token
            const ticket = await googleClient.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const { sub: googleId, email, name, picture } = payload;

            // Find or create user
            let user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                // Create new user
                user = await prisma.user.create({
                    data: {
                        email,
                        googleId,
                        authProvider: "GOOGLE",
                        fullName: name,
                        avatarUrl: picture,
                        isEmailVerified: true, // Google emails are pre-verified
                    },
                });

                // Create onboarding data
                await prisma.onboardingData.create({
                    data: {
                        userId: user.id,
                        currentStep: 1,
                    },
                });
            } else if (!user.googleId) {
                // Update existing email user with Google info
                user = await prisma.user.update({
                    where: { email },
                    data: {
                        googleId,
                        authProvider: "GOOGLE",
                        isEmailVerified: true,
                    },
                });
            }

            // Generate tokens
            const tokens = JwtService.generateAuthTokens(user);

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    avatarUrl: user.avatarUrl,
                    isEmailVerified: user.isEmailVerified,
                },
                tokens,
            };
        } catch (error) {
            throw ApiError.unauthorized("Invalid Google token");
        }
    }

    /**
     * Login with email and password
     * @param {String} email - User email
     * @param {String} password - User password
     * @returns {Object} User and tokens
     */
    static async loginWithPassword(email, password) {
        // Find user with onboarding data
        const user = await prisma.user.findUnique({
            where: { email },
            include: { onboardingData: true },
        });

        if (!user || !user.passwordHash) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        if (!user.isEmailVerified) {
            throw ApiError.unauthorized("Please verify your email first");
        }

        // Generate tokens
        const tokens = JwtService.generateAuthTokens(user);

        // Include onboarding status
        const onboardingStatus = {
            isComplete: user.onboardingData?.completedAt !== null,
            currentStep: user.onboardingData?.currentStep || 1,
        };

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                isEmailVerified: user.isEmailVerified,
            },
            tokens,
            onboardingStatus,
        };
    }

    /**
     * Get user by ID
     * @param {String} userId - User ID
     * @returns {Object} User object
     */
    static async getUserById(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
                authProvider: true,
                isEmailVerified: true,
                twoFaEnabled: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw ApiError.notFound("User not found");
        }

        return user;
    }

    /**
     * Hash password
     * @param {String} password - Plain text password
     * @returns {String} Hashed password
     */
    static async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }

    /**
     * Request password reset
     * @param {String} email - User email
     * @returns {Object} Success message
     */
    static async requestPasswordReset(email) {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if user exists or not for security
            return {
                message:
                    "If this email is registered, you will receive a password reset link",
            };
        }

        // Generate reset token
        const crypto = require("crypto");
        const resetToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

        // Store reset token
        await prisma.passwordReset.create({
            data: {
                email,
                token: resetToken,
                expiresAt,
            },
        });

        // Send reset email
        await EmailService.sendPasswordResetEmail(email, resetToken);

        return {
            message:
                "If this email is registered, you will receive a password reset link",
        };
    }

    /**
     * Reset password with token
     * @param {String} token - Reset token
     * @param {String} newPassword - New password
     * @returns {Object} Success message
     */
    static async resetPassword(token, newPassword) {
        // Find valid reset token
        const resetRecord = await prisma.passwordReset.findUnique({
            where: { token },
        });

        if (
            !resetRecord ||
            resetRecord.isUsed ||
            resetRecord.expiresAt < new Date()
        ) {
            throw ApiError.badRequest("Invalid or expired reset token");
        }

        // Hash new password
        const passwordHash = await this.hashPassword(newPassword);

        // Update user password
        await prisma.user.update({
            where: { email: resetRecord.email },
            data: { passwordHash },
        });

        // Mark token as used
        await prisma.passwordReset.update({
            where: { token },
            data: { isUsed: true },
        });

        return {
            message: "Password reset successful",
        };
    }

    /**
     * Get user with onboarding status
     * @param {String} userId - User ID
     * @returns {Object} User with onboarding status
     */
    static async getUserWithOnboardingStatus(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { onboardingData: true },
        });

        if (!user) {
            throw ApiError.notFound("User not found");
        }

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                isEmailVerified: user.isEmailVerified,
            },
            onboardingStatus: {
                isComplete: user.onboardingData?.completedAt !== null,
                currentStep: user.onboardingData?.currentStep || 1,
            },
        };
    }

    /**
     * Refresh access token
     * @param {String} refreshToken - Refresh token
     * @returns {Object} New access token
     */
    static async refreshAccessToken(refreshToken) {
        if (!refreshToken) {
            throw ApiError.badRequest("Refresh token is required");
        }

        try {
            // Verify refresh token
            const decoded = JwtService.verifyToken(refreshToken);

            // Get user from database
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
            });

            if (!user) {
                throw ApiError.unauthorized("User not found");
            }

            // Generate new access token
            const payload = {
                id: user.id,
                email: user.email,
            };

            const accessToken = JwtService.generateToken(payload);

            return {
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    avatarUrl: user.avatarUrl,
                    isEmailVerified: user.isEmailVerified,
                },
            };
        } catch (error) {
            throw ApiError.unauthorized("Invalid or expired refresh token");
        }
    }
}

module.exports = AuthService;
