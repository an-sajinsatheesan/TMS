const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Tenant Controller
 * Handles tenant/workspace operations
 */

class TenantController {
  /**
   * @route   GET /api/v1/tenants
   * @desc    Get all tenants for current user
   * @access  Private
   */
  static getTenants = asyncHandler(async (req, res) => {
    const memberships = await prisma.tenant_users.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        tenants: {
          include: {
            subscriptionPlan: true,
            owner: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const tenants = memberships.map(membership => ({
      ...membership.tenants,
      userRole: membership.role,
      joinedAt: membership.joinedAt,
    }));

    ApiResponse.success({ tenants }, 'Tenants retrieved successfully').send(res);
  });

  /**
   * @route   GET /api/v1/tenants/:tenantId/settings
   * @desc    Get tenant settings
   * @access  Private (Tenant Admin)
   */
  static getSettings = asyncHandler(async (req, res) => {
    const { tenant, tenantRole } = req;

    // Only tenant admin can view settings
    if (tenantRole !== 'ADMIN' && tenantRole !== 'OWNER' && tenantRole !== 'SUPER_ADMIN') {
      throw ApiError.forbidden('Tenant admin access required');
    }

    ApiResponse.success({ tenant }, 'Tenant settings retrieved').send(res);
  });

  /**
   * @route   PATCH /api/v1/tenants/:tenantId/settings
   * @desc    Update tenant settings
   * @access  Private (Tenant Admin)
   */
  static updateSettings = asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const { name, emailConfig, messageConfig, productKey } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (emailConfig !== undefined) updateData.emailConfig = emailConfig;
    if (messageConfig !== undefined) updateData.messageConfig = messageConfig;
    if (productKey !== undefined) updateData.productKey = productKey;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
      include: {
        subscriptionPlan: true,
        owner: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    ApiResponse.success({ tenant }, 'Tenant settings updated successfully').send(res);
  });

  /**
   * @route   GET /api/v1/tenants/:tenantId/members
   * @desc    Get all members of a tenant with their project access
   * @access  Private (Tenant Member)
   */
  static getMembers = asyncHandler(async (req, res) => {
    const { tenantId } = req.params;

    const members = await prisma.tenant_users.findMany({
      where: {
        tenantId: tenantId,
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            project_members: {
              where: {
                project: {
                  tenantId: tenantId, // Only projects from this tenant
                },
              },
              include: {
                project: {
                  select: {
                    id: true,
                    name: true,
                    color: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { role: 'desc' }, // Admins first
        { joinedAt: 'desc' },
      ],
    });

    // Map to consistent format with project access
    const formattedMembers = members.map(member => ({
      id: member.id,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      isPending: member.status === 'PENDING',
      user: member.users,
      projects: member.users.project_members.map(pm => ({
        id: pm.project.id,
        name: pm.project.name,
        color: pm.project.color,
        role: pm.role,
      })),
    }));

    ApiResponse.success({ members: formattedMembers }, 'Tenant members retrieved successfully').send(res);
  });

  /**
   * @route   PATCH /api/v1/tenants/:tenantId/members/:userId
   * @desc    Update tenant member role
   * @access  Private (Tenant Admin)
   */
  static updateMemberRole = asyncHandler(async (req, res) => {
    const { tenantId, userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['OWNER', 'ADMIN', 'MEMBER'];
    if (!validRoles.includes(role)) {
      return ApiResponse.error('Invalid role', 400).send(res);
    }

    // Check if trying to update owner
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { ownerId: true },
    });

    if (tenant.ownerId === userId) {
      return ApiResponse.error('Cannot change owner role', 403).send(res);
    }

    // Update member role
    const updatedMember = await prisma.tenant_users.updateMany({
      where: {
        tenantId: tenantId,
        userId: userId,
      },
      data: {
        role: role,
      },
    });

    if (updatedMember.count === 0) {
      return ApiResponse.error('Member not found', 404).send(res);
    }

    ApiResponse.success({ role }, 'Member role updated successfully').send(res);
  });

  /**
   * @route   DELETE /api/v1/tenants/:tenantId/members/:userId
   * @desc    Remove member from tenant
   * @access  Private (Tenant Admin)
   */
  static removeMember = asyncHandler(async (req, res) => {
    const { tenantId, userId } = req.params;

    // Check if trying to remove owner
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { ownerId: true },
    });

    if (tenant.ownerId === userId) {
      return ApiResponse.error('Cannot remove tenant owner', 403).send(res);
    }

    // Remove member
    const deleted = await prisma.tenant_users.deleteMany({
      where: {
        tenantId: tenantId,
        userId: userId,
      },
    });

    if (deleted.count === 0) {
      return ApiResponse.error('Member not found', 404).send(res);
    }

    ApiResponse.success(null, 'Member removed successfully').send(res);
  });
}

module.exports = TenantController;
