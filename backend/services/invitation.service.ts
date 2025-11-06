const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const EmailService = require('./email.service');

/**
 * Invitation Service
 * Handles tenant and project invitation logic
 */

class InvitationService {
  /**
   * Send tenant invitation
   * @param {String} tenantId - Tenant ID
   * @param {Array} emails - Array of emails to invite
   * @param {String} inviterId - ID of user sending invitation
   * @param {String} role - Role for invitee (default: MEMBER)
   * @returns {Array} Created invitations
   */
  static async sendTenantInvitations(tenantId, emails, inviterId, role = 'MEMBER') {
    // Get tenant info
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { owner: true },
    });

    if (!tenant) {
      throw ApiError.notFound('Workspace not found');
    }

    // Get inviter info
    const inviter = await prisma.user.findUnique({
      where: { id: inviterId },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const invitations = [];

    for (const email of emails) {
      // Check if user is already a member
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        const existingMember = await prisma.tenantUser.findUnique({
          where: {
            tenantId_userId: {
              tenantId,
              userId: existingUser.id,
            },
          },
        });

        if (existingMember) {
          continue; // Skip - already a member
        }
      }

      // Check for existing pending invitation
      const existingInvitation = await prisma.invitation.findFirst({
        where: {
          tenantId,
          email,
          status: 'PENDING',
          type: 'TENANT',
        },
      });

      let invitation;

      if (existingInvitation) {
        // Update existing invitation
        invitation = await prisma.invitation.update({
          where: { id: existingInvitation.id },
          data: {
            token: uuidv4(),
            role,
            expiresAt,
            invitedBy: inviterId,
          },
        });
      } else {
        // Create new invitation
        invitation = await prisma.invitation.create({
          data: {
            tenantId,
            email,
            invitedBy: inviterId,
            token: uuidv4(),
            type: 'TENANT',
            role,
            expiresAt,
          },
        });
      }

      invitations.push(invitation);

      // Send invitation email
      await EmailService.sendInvitationEmail(
        email,
        tenant.name,
        inviter.fullName || inviter.email,
        invitation.token
      );
    }

    return invitations;
  }

  /**
   * Send project invitation
   * @param {String} projectId - Project ID
   * @param {Array} emails - Array of emails to invite
   * @param {String} inviterId - ID of user sending invitation
   * @returns {Array} Created invitations
   */
  static async sendProjectInvitations(projectId, emails, inviterId) {
    // Get project and tenant info
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tenant: true,
        creator: true,
      },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // Get inviter info
    const inviter = await prisma.user.findUnique({
      where: { id: inviterId },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const invitations = [];

    for (const email of emails) {
      // Check for existing pending invitation
      const existingInvitation = await prisma.invitation.findFirst({
        where: {
          tenantId: project.tenantId,
          projectId,
          email,
          status: 'PENDING',
          type: 'PROJECT',
        },
      });

      let invitation;

      if (existingInvitation) {
        // Update existing invitation
        invitation = await prisma.invitation.update({
          where: { id: existingInvitation.id },
          data: {
            token: uuidv4(),
            expiresAt,
            invitedBy: inviterId,
          },
        });
      } else {
        // Create new invitation
        invitation = await prisma.invitation.create({
          data: {
            tenantId: project.tenantId,
            projectId,
            email,
            invitedBy: inviterId,
            token: uuidv4(),
            type: 'PROJECT',
            role: 'MEMBER',
            expiresAt,
          },
        });
      }

      invitations.push(invitation);

      // Send project invitation email
      const projectLink = `${process.env.CLIENT_URL}/accept-invitation/${invitation.token}`;
      await EmailService.sendInvitationEmail(
        email,
        `${project.name} (${project.tenant.name})`,
        inviter.fullName || inviter.email,
        invitation.token
      );
    }

    return invitations;
  }

  /**
   * Accept invitation (tenant or project)
   * @param {String} token - Invitation token
   * @param {String} userId - User ID (optional, for logged-in users)
   * @returns {Object} Result with tenant/project info
   */
  static async acceptInvitation(token, userId = null) {
    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        tenant: true,
        project: true,
      },
    });

    if (!invitation) {
      throw ApiError.notFound('Invitation not found');
    }

    if (invitation.status !== 'PENDING') {
      throw ApiError.badRequest('Invitation has already been used');
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });

      throw ApiError.badRequest('Invitation has expired');
    }

    // Find or create user
    let user = userId ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({ where: { email: invitation.email } });

    if (!user) {
      // Create new user (unverified)
      user = await prisma.user.create({
        data: {
          email: invitation.email,
          authProvider: 'EMAIL',
          isEmailVerified: false,
        },
      });

      // Create onboarding data
      await prisma.onboardingData.create({
        data: {
          userId: user.id,
          currentStep: 1,
        },
      });
    }

    // Add user to tenant if not already a member
    const existingMember = await prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId: invitation.tenantId,
          userId: user.id,
        },
      },
    });

    if (!existingMember) {
      await prisma.tenantUser.create({
        data: {
          tenantId: invitation.tenantId,
          userId: user.id,
          role: invitation.role,
        },
      });
    }

    // If this is a project invitation, also add user to project members
    if (invitation.type === 'PROJECT' && invitation.projectId) {
      const existingProjectMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: invitation.projectId,
            userId: user.id,
          },
        },
      });

      if (!existingProjectMember) {
        await prisma.projectMember.create({
          data: {
            projectId: invitation.projectId,
            userId: user.id,
            role: invitation.role || 'MEMBER',
          },
        });
      }
    }

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    return {
      tenant: invitation.tenant,
      project: invitation.project,
      type: invitation.type,
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  /**
   * Get pending invitations for user
   * @param {String} email - User email
   * @returns {Array} Pending invitations
   */
  static async getPendingInvitationsForUser(email) {
    const invitations = await prisma.invitation.findMany({
      where: {
        email,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        tenant: true,
        project: true,
        inviter: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations;
  }

  /**
   * Get invitation details by token
   * @param {String} token - Invitation token
   * @returns {Object} Invitation details
   */
  static async getInvitationByToken(token) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        tenant: true,
        project: true,
        inviter: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!invitation) {
      throw ApiError.notFound('Invitation not found');
    }

    if (invitation.status !== 'PENDING') {
      throw ApiError.badRequest('Invitation has already been used');
    }

    if (new Date() > invitation.expiresAt) {
      throw ApiError.badRequest('Invitation has expired');
    }

    return invitation;
  }
}

module.exports = InvitationService;
