const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const EmailService = require('../services/email.service');

/**
 * ProjectMember Controller
 * Handles project member management
 */

class ProjectMemberController {
  /**
   * @route   GET /api/v1/projects/:projectId/members
   * @desc    List project members
   * @access  Private (requires ProjectMember)
   */
  static listMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Get current project members
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      orderBy: { joinedAt: 'asc' },
      select: {
        id: true,
        projectId: true,
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
        projectRole: true,
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
    const formattedInvitations = pendingInvitations.map(inv => ({
      id: inv.id,
      projectId,
      userId: null,
      role: inv.projectRole,
      joinedAt: inv.createdAt,
      isPending: true, // Flag to identify pending invitations
      user: {
        id: null,
        fullName: null,
        email: inv.email,
        avatarUrl: null,
      },
      invitedBy: inv.inviter,
    }));

    // Combine members and pending invitations
    const allMembers = [...members, ...formattedInvitations];

    ApiResponse.success(allMembers, 'Project members retrieved successfully').send(res);
  });

  /**
   * @route   POST /api/v1/projects/:projectId/members/invite
   * @desc    Invite members to project
   * @access  Private (requires OWNER or ADMIN)
   */
  static inviteMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { emails, role } = req.body;
    const userId = req.user.id;

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
    const existingMembers = await prisma.projectMember.findMany({
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
      ...existingInvitations.map((i) => i.email),
    ];

    const newEmails = emails.filter((email) => !existingEmails.includes(email));

    if (newEmails.length === 0) {
      throw ApiError.badRequest('All emails already have access or pending invitations');
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
          type: 'PROJECT',
          role: 'MEMBER', // Tenant role (default)
          projectRole: role || 'MEMBER', // Project-specific role
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
   * @access  Private (requires OWNER)
   */
  static updateMemberRole = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params;
    const { role } = req.body;

    // Check if member exists
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw ApiError.notFound('Member not found');
    }

    if (member.projectId !== projectId) {
      throw ApiError.badRequest('Member does not belong to this project');
    }

    // If demoting from OWNER, ensure there's at least one other OWNER
    if (member.role === 'OWNER' && role !== 'OWNER') {
      const ownerCount = await prisma.projectMember.count({
        where: {
          projectId,
          role: 'OWNER',
        },
      });

      if (ownerCount <= 1) {
        throw ApiError.badRequest('Cannot demote the last owner. Assign another owner first.');
      }
    }

    // Update role
    const updatedMember = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role },
      select: {
        id: true,
        projectId: true,
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

    ApiResponse.success(updatedMember, 'Member role updated successfully').send(res);
  });

  /**
   * @route   DELETE /api/v1/projects/:projectId/members/:memberId
   * @desc    Remove member from project
   * @access  Private (requires OWNER or ADMIN)
   */
  static removeMember = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params;

    // Check if member exists
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw ApiError.notFound('Member not found');
    }

    if (member.projectId !== projectId) {
      throw ApiError.badRequest('Member does not belong to this project');
    }

    // If removing an OWNER, ensure there's at least one other OWNER
    if (member.role === 'OWNER') {
      const ownerCount = await prisma.projectMember.count({
        where: {
          projectId,
          role: 'OWNER',
        },
      });

      if (ownerCount <= 1) {
        throw ApiError.badRequest('Cannot remove the last owner. Assign another owner first.');
      }
    }

    // Remove member
    await prisma.projectMember.delete({
      where: { id: memberId },
    });

    ApiResponse.success(null, 'Member removed successfully').send(res);
  });
}

module.exports = ProjectMemberController;
