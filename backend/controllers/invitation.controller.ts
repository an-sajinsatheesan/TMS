const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const InvitationService = require('../services/invitation.service');

/**
 * Invitation Controller
 * Handles team member invitations
 */

class InvitationController {
  /**
   * @route   POST /api/v1/invitations/send-tenant
   * @desc    Send invitations to join tenant
   * @access  Private
   */
  static sendTenantInvitations = asyncHandler(async (req, res) => {
    const { tenantId, emails, role } = req.body;
    const userId = req.user.id;

    // Verify user has access to tenant
    const tenantUser = await prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    });

    if (!tenantUser) {
      throw ApiError.forbidden('You do not have access to this workspace');
    }

    // Only OWNER and ADMIN can send invitations
    if (tenantUser.role !== 'OWNER' && tenantUser.role !== 'ADMIN') {
      throw ApiError.forbidden('You do not have permission to invite members');
    }

    const invitations = await InvitationService.sendTenantInvitations(
      tenantId,
      emails,
      userId,
      role
    );

    ApiResponse.success(
      { invitations },
      `${invitations.length} invitation(s) sent successfully`
    ).send(res);
  });

  /**
   * @route   POST /api/v1/invitations/send-project
   * @desc    Send invitations to join project
   * @access  Private
   */
  static sendProjectInvitations = asyncHandler(async (req, res) => {
    const { projectId, emails } = req.body;
    const userId = req.user.id;

    // Verify user has access to project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tenant: true },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // Verify user is a member of the tenant
    const tenantUser = await prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId: project.tenantId,
          userId,
        },
      },
    });

    if (!tenantUser) {
      throw ApiError.forbidden('You do not have access to this project');
    }

    const invitations = await InvitationService.sendProjectInvitations(
      projectId,
      emails,
      userId
    );

    ApiResponse.success(
      { invitations },
      `${invitations.length} invitation(s) sent successfully`
    ).send(res);
  });

  /**
   * @route   GET /api/v1/invitations/:token
   * @desc    Get invitation details by token
   * @access  Public
   */
  static getInvitationDetails = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const invitation = await InvitationService.getInvitationByToken(token);

    ApiResponse.success({ invitation }, 'Invitation details retrieved').send(res);
  });

  /**
   * @route   POST /api/v1/invitations/accept/:token
   * @desc    Accept invitation and join tenant/project
   * @access  Public (can be authenticated)
   */
  static acceptInvitation = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const userId = req.user?.id; // Optional - for logged-in users

    const result = await InvitationService.acceptInvitation(token, userId);

    ApiResponse.success(
      result,
      `Successfully joined ${result.type === 'PROJECT' ? 'project' : 'workspace'}`
    ).send(res);
  });

  /**
   * @route   GET /api/v1/invitations/pending
   * @desc    Get pending invitations for current user
   * @access  Private
   */
  static getPendingInvitations = asyncHandler(async (req, res) => {
    const invitations = await InvitationService.getPendingInvitationsForUser(req.user.email);

    ApiResponse.success({ invitations }, 'Pending invitations retrieved').send(res);
  });
}

module.exports = InvitationController;
