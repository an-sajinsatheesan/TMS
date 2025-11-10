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
    const memberships = await prisma.membership.findMany({
      where: {
        userId: req.user.id,
        level: 'TENANT',
      },
      include: {
        tenant: {
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
      ...membership.tenant,
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
    if (tenantRole !== 'TENANT_ADMIN' && tenantRole !== 'SUPER_ADMIN') {
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
}

module.exports = TenantController;
