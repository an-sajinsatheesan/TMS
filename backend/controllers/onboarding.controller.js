const bcrypt = require('bcryptjs');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const EmailService = require('../services/email.service');
const JwtService = require('../services/jwt.service');

/**
 * Onboarding Controller
 * Handles the 9-step user onboarding process
 */

class OnboardingController {
  /**
   * @route   GET /api/v1/onboarding/progress
   * @desc    Get current onboarding step and saved data
   * @access  Private
   */
  static getProgress = asyncHandler(async (req, res) => {
    const onboardingData = await prisma.onboardingData.findUnique({
      where: { userId: req.user.id },
    });

    if (!onboardingData) {
      throw ApiError.notFound('Onboarding data not found');
    }

    ApiResponse.success(onboardingData, 'Onboarding progress retrieved').send(res);
  });

  /**
   * @route   POST /api/v1/onboarding/profile
   * @desc    Complete account registration - Sets name and password AFTER OTP verification
   * @access  Private (requires valid token from OTP verification)
   */
  static saveProfile = asyncHandler(async (req, res) => {
    const { fullName, password, avatarUrl } = req.body;

    // Validation
    if (!fullName || !password) {
      throw ApiError.badRequest('Full name and password are required');
    }

    // Verify user's email is verified
    if (!req.user.isEmailVerified) {
      throw ApiError.unauthorized('Please verify your email first');
    }

    // Update user with full account details
    const updateData = { fullName };
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    // Create or update onboarding data - ALWAYS start at step 1 for new users!
    let onboardingData = await prisma.onboardingData.findUnique({
      where: { userId: req.user.id },
    });

    if (!onboardingData) {
      // First time - create onboarding data starting at step 1
      onboardingData = await prisma.onboardingData.create({
        data: {
          userId: req.user.id,
          currentStep: 1, // ← ALWAYS START AT STEP 1, NOT 4!
        },
      });
    } else {
      // Update existing onboarding data - ensure it's at step 1
      onboardingData = await prisma.onboardingData.update({
        where: { userId: req.user.id },
        data: { currentStep: 1 }, // Reset to step 1 since profile is now complete
      });
    }

    // Generate tokens NOW (after password is set)
    const tokens = JwtService.generateAuthTokens(updatedUser);

    ApiResponse.success(
      {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          avatarUrl: updatedUser.avatarUrl,
          isEmailVerified: updatedUser.isEmailVerified,
        },
        tokens, // ← Tokens generated ONLY after account is fully created
        onboardingStatus: {
          isComplete: false,
          currentStep: 1, // ← NEW USERS ALWAYS START AT STEP 1
        },
      },
      'Account created successfully. Welcome to the platform!'
    ).send(res);
  });

  /**
   * @route   POST /api/v1/onboarding/app-usage
   * @desc    Save app usage selection (Step 4)
   * @access  Private
   */
  static saveAppUsage = asyncHandler(async (req, res) => {
    const { usageIds } = req.body;

    const onboardingData = await prisma.onboardingData.update({
      where: { userId: req.user.id },
      data: {
        appUsageIds: usageIds || [],
        currentStep: 5,
      },
    });

    ApiResponse.success(onboardingData, 'App usage saved').send(res);
  });

  /**
   * @route   POST /api/v1/onboarding/industry
   * @desc    Save industry selection (Step 5)
   * @access  Private
   */
  static saveIndustry = asyncHandler(async (req, res) => {
    const { industryIds, otherIndustry } = req.body;

    const existing = await prisma.onboardingData.findUnique({
      where: { userId: req.user.id },
      select: { data: true },
    });

    const onboardingData = await prisma.onboardingData.update({
      where: { userId: req.user.id },
      data: {
        industryIds: industryIds || [],
        data: {
          ...existing?.data,
          otherIndustry,
        },
        currentStep: 6,
      },
    });

    ApiResponse.success(onboardingData, 'Industry saved').send(res);
  });

  /**
   * @route   POST /api/v1/onboarding/team-size
   * @desc    Save team size selection (Step 6)
   * @access  Private
   */
  static saveTeamSize = asyncHandler(async (req, res) => {
    const { teamSizeId } = req.body;

    const onboardingData = await prisma.onboardingData.update({
      where: { userId: req.user.id },
      data: {
        teamSizeId,
        currentStep: 7,
      },
    });

    ApiResponse.success(onboardingData, 'Team size saved').send(res);
  });

  /**
   * @route   POST /api/v1/onboarding/role-info
   * @desc    Save role and function information (Step 7 - legacy)
   * @access  Private
   */
  static saveRoleInfo = asyncHandler(async (req, res) => {
    const { role, functions, useCases } = req.body;

    const onboardingData = await prisma.onboardingData.update({
      where: { userId: req.user.id },
      data: {
        role,
        functions: functions || [],
        useCases: useCases || [],
        currentStep: 8,
      },
    });

    ApiResponse.success(onboardingData, 'Role information saved').send(res);
  });

  /**
   * @route   POST /api/v1/onboarding/project-setup
   * @desc    Save project setup (Steps 5-7)
   * @access  Private
   */
  static saveProjectSetup = asyncHandler(async (req, res) => {
    const { projectName, tasks, sections } = req.body;

    const onboardingData = await prisma.onboardingData.update({
      where: { userId: req.user.id },
      data: {
        projectName,
        tasks: tasks || [],
        sections: sections || [],
        currentStep: 8,
      },
    });

    ApiResponse.success(onboardingData, 'Project setup saved').send(res);
  });

  /**
   * @route   POST /api/v1/onboarding/layout
   * @desc    Save layout preference (Step 8)
   * @access  Private
   */
  static saveLayout = asyncHandler(async (req, res) => {
    const { layout } = req.body;

    const onboardingData = await prisma.onboardingData.update({
      where: { userId: req.user.id },
      data: {
        layoutPreference: layout,
        currentStep: 9,
      },
    });

    ApiResponse.success(onboardingData, 'Layout preference saved').send(res);
  });

  /**
   * @route   POST /api/v1/onboarding/complete
   * @desc    Complete onboarding - create tenant, project, and send invites (Step 9)
   * @access  Private
   */
  static completeOnboarding = asyncHandler(async (req, res) => {
    const { inviteEmails } = req.body;
    const userId = req.user.id;

    // Get onboarding data
    const onboardingData = await prisma.onboardingData.findUnique({
      where: { userId },
    });

    if (!onboardingData) {
      throw ApiError.notFound('Onboarding data not found');
    }

    // Get or create default subscription plan
    let subscriptionPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: 'Free Trial' },
    });

    if (!subscriptionPlan) {
      subscriptionPlan = await prisma.subscriptionPlan.create({
        data: {
          name: 'Free Trial',
          features: {
            maxUsers: 5,
            maxProjects: 10,
            storage: '1GB',
          },
          price: 0,
          trialDays: 14,
        },
      });
    }

    // Generate tenant slug
    const tenantName = onboardingData.projectName || `${req.user.fullName}'s Workspace`;
    let slug = slugify(tenantName, { lower: true, strict: true });

    // Ensure unique slug
    const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      slug = `${slug}-${Date.now()}`;
    }

    // Calculate trial end date
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + subscriptionPlan.trialDays);

    // Create tenant (workspace)
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        slug,
        ownerId: userId,
        subscriptionPlanId: subscriptionPlan.id,
        trialEndsAt,
      },
    });

    // Add owner to tenant_users
    await prisma.tenantUser.create({
      data: {
        tenantId: tenant.id,
        userId,
        role: 'OWNER',
      },
    });

    // Create project
    const project = await prisma.project.create({
      data: {
        tenantId: tenant.id,
        name: onboardingData.projectName || 'My First Project',
        layout: onboardingData.layoutPreference || 'LIST',
        createdBy: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
    });

    // Create sections if provided
    const sections = onboardingData.sections || [];
    if (sections.length > 0) {
      for (const section of sections) {
        await prisma.projectSection.create({
          data: {
            projectId: project.id,
            name: section.name,
            position: section.position || 0,
          },
        });
      }
    }

    // Create tasks if provided
    const tasks = onboardingData.tasks || [];
    if (tasks.length > 0) {
      // Get sections for mapping
      const createdSections = await prisma.projectSection.findMany({
        where: { projectId: project.id },
      });

      for (const task of tasks) {
        const section = createdSections.find(s => s.name === task.sectionName);

        await prisma.task.create({
          data: {
            projectId: project.id,
            sectionId: section?.id || null,
            title: task.title,
            createdBy: userId,
          },
        });
      }
    }

    // Send invitations if provided
    const invitations = [];
    if (inviteEmails && inviteEmails.length > 0) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      for (const email of inviteEmails) {
        const token = uuidv4();

        const invitation = await prisma.invitation.create({
          data: {
            tenantId: tenant.id,
            email,
            invitedBy: userId,
            token,
            expiresAt,
          },
        });

        invitations.push(invitation);

        // Send invitation email
        await EmailService.sendInvitationEmail(
          email,
          tenant.name,
          req.user.fullName || req.user.email,
          token
        );
      }
    }

    // Mark onboarding as completed
    await prisma.onboardingData.update({
      where: { userId },
      data: {
        completedAt: new Date(),
        currentStep: 10, // Completed
      },
    });

    ApiResponse.success(
      {
        tenant,
        project,
        invitationsSent: invitations.length,
        redirectTo: `/projects/${project.id}`, // Frontend should redirect to first project
      },
      'Onboarding completed successfully'
    ).send(res);
  });
}

module.exports = OnboardingController;
