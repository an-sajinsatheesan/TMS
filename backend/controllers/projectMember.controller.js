const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const EmailService = require('../services/email.service');

/**
 * Project Member Controller
 * Handles project membership management using unified Membership model
 */

class ProjectMemberController {
  /**
   * @route   GET /api/v1/projects/:projectId/members
   * @desc    List project members (both project-level and tenant-level)
   * @access  Private (requires project membership)
   */
  static listMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Get project info
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        tenantId: true,
      },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // Get project-specific members
    const projectMembers = await prisma.project_members.findMany({
      where: {
        projectId,
      },
      orderBy: { joinedAt: 'asc' },
      select: {
        id: true,
        userId: true,
        role: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Get tenant-level members (they have access to all projects)
    const tenantMembers = await prisma.tenant_users.findMany({
      where: {
        tenantId: project.tenantId,
      },
      orderBy: { joinedAt: 'asc' },
      select: {
        id: true,
        userId: true,
        role: true,
        joinedAt: true,
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Format members with metadata
    const formattedProjectMembers = projectMembers.map((member) => ({
      id: member.id,
      projectId,
      userId: member.userId,
      role: member.role,
      level: 'PROJECT',
      joinedAt: member.joinedAt,
      isProjectSpecific: true,
      user: member.user,
    }));

    const formattedTenantMembers = tenantMembers.map((member) => ({
      id: member.id,
      projectId: null,
      userId: member.userId,
      role: member.role,
      level: 'TENANT',
      joinedAt: member.joinedAt,
      isProjectSpecific: false,
      user: member.users,
    }));

    // Get pending invitations for this project
    const pendingInvitations = await prisma.invitation.findMany({
      where: {
        projectId,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(), // Only non-expired invitations
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        inviter: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Format pending invitations to match member structure
    const formattedInvitations = pendingInvitations.map((inv) => ({
      id: inv.id,
      projectId,
      userId: null,
      role: inv.role,
      level: 'PROJECT',
      joinedAt: inv.createdAt,
      isPending: true, // Flag to identify pending invitations
      isProjectSpecific: true,
      user: {
        id: null,
        fullName: null,
        email: inv.email,
        avatarUrl: null,
      },
      invitedBy: inv.inviter,
    }));

    // Combine all members
    const allMembers = [
      ...formattedProjectMembers,
      ...formattedTenantMembers,
      ...formattedInvitations,
    ];

    ApiResponse.success(
      allMembers,
      'Project members retrieved successfully'
    ).send(res);
  });

  /**
   * @route   POST /api/v1/projects/:projectId/members/invite
   * @desc    Invite members to project
   * @access  Private (requires PROJECT_ADMIN or higher)
   */
  static inviteMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { emails, role } = req.body;
    const userId = req.user.id;

    // Validate role
    const validRoles = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'];
    if (role && !validRoles.includes(role)) {
      throw ApiError.badRequest(
        `Invalid role. Must be one of: ${validRoles.join(', ')}`
      );
    }

    // Get project and tenant info
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        tenantId: true,
        tenant: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // Check if emails already have access or pending invitations
    const existingMembers = await prisma.project_members.findMany({
      where: {
        projectId,
        user: {
          email: {
            in: emails,
          },
        },
      },
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    // Also check tenant-level members
    const existingTenantMembers = await prisma.tenant_users.findMany({
      where: {
        tenantId: project.tenantId,
        users: {
          email: {
            in: emails,
          },
        },
      },
      select: {
        users: {
          select: {
            email: true,
          },
        },
      },
    });

    const existingInvitations = await prisma.invitation.findMany({
      where: {
        projectId,
        email: {
          in: emails,
        },
        status: 'PENDING',
      },
      select: {
        email: true,
      },
    });

    const existingEmails = [
      ...existingMembers.map((m) => m.user.email),
      ...existingTenantMembers.map((m) => m.users.email),
      ...existingInvitations.map((i) => i.email),
    ];

    const newEmails = emails.filter((email) => !existingEmails.includes(email));

    if (newEmails.length === 0) {
      throw ApiError.badRequest(
        'All emails already have access or pending invitations'
      );
    }

    // Create invitations
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const invitations = [];

    for (const email of newEmails) {
      const token = uuidv4();

      const invitation = await prisma.invitation.create({
        data: {
          tenantId: project.tenantId,
          projectId,
          email,
          invitedBy: userId,
          token,
          role: role || 'MEMBER', // Default to MEMBER
          expiresAt,
        },
      });

      invitations.push(invitation);

      // Send invitation email
      try {
        await EmailService.sendInvitationEmail(
          email,
          `${project.tenant.name} - ${project.name}`,
          req.user.fullName || req.user.email,
          token
        );
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Continue even if email fails
      }
    }

    ApiResponse.success(
      {
        invitationsSent: invitations.length,
        invitations,
        skipped: emails.length - newEmails.length,
      },
      `${invitations.length} invitation(s) sent successfully`
    ).send(res, 201);
  });

  /**
   * @route   PATCH /api/v1/projects/:projectId/members/:memberId
   * @desc    Update member role
   * @access  Private (requires PROJECT_ADMIN or higher, and can only manage lower roles)
   */
  static updateMemberRole = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'];
    if (!validRoles.includes(role)) {
      throw ApiError.badRequest(
        `Invalid role. Must be one of: ${validRoles.join(', ')}`
      );
    }

    // Check if member exists
    const member = await prisma.project_members.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw ApiError.notFound('Member not found');
    }

    // Verify member belongs to this project
    if (member.projectId !== projectId) {
      throw ApiError.badRequest('Member does not belong to this project');
    }

    // If demoting from OWNER or ADMIN, ensure there's at least one other OWNER or ADMIN
    if ((member.role === 'OWNER' || member.role === 'ADMIN') && (role !== 'OWNER' && role !== 'ADMIN')) {
      const adminCount = await prisma.project_members.count({
        where: {
          projectId,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      });

      if (adminCount <= 1) {
        throw ApiError.badRequest(
          'Cannot demote the last project admin. Assign another admin first.'
        );
      }
    }

    // Update role
    const updatedMember = await prisma.project_members.update({
      where: { id: memberId },
      data: { role },
      select: {
        id: true,
        userId: true,
        role: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    ApiResponse.success(
      {
        ...updatedMember,
        level: 'PROJECT'
      },
      'Member role updated successfully'
    ).send(res);
  });

  /**
   * @route   DELETE /api/v1/projects/:projectId/members/:memberId
   * @desc    Remove member from project
   * @access  Private (requires PROJECT_ADMIN or higher)
   */
  static removeMember = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params;

    // Check if member exists
    const member = await prisma.project_members.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw ApiError.notFound('Member not found');
    }

    // Verify member belongs to this project
    if (member.projectId !== projectId) {
      throw ApiError.badRequest('Member does not belong to this project');
    }

    // If removing an OWNER or ADMIN, ensure there's at least one other OWNER or ADMIN
    if (member.role === 'OWNER' || member.role === 'ADMIN') {
      const adminCount = await prisma.project_members.count({
        where: {
          projectId,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      });

      if (adminCount <= 1) {
        throw ApiError.badRequest(
          'Cannot remove the last project admin. Assign another admin first.'
        );
      }
    }

    // Remove member
    await prisma.project_members.delete({
      where: { id: memberId },
    });

    ApiResponse.success(null, 'Member removed successfully').send(res);
  });
}

module.exports = ProjectMemberController;
