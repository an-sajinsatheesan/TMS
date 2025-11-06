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
    const tenantUsers = await prisma.tenantUser.findMany({
      where: { userId: req.user.id },
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

    const tenants = tenantUsers.map(tu => ({
      ...tu.tenant,
      userRole: tu.role,
      joinedAt: tu.joinedAt,
    }));

    ApiResponse.success({ tenants }, 'Tenants retrieved successfully').send(res);
  });

  /**
   * @route   GET /api/v1/tenants/:tenantId/settings
   * @desc    Get tenant settings
   * @access  Private (Admin/Owner)
   */
  static getSettings = asyncHandler(async (req, res) => {
    const { tenant, tenantRole } = req;

    // Only admin/owner can view settings
    if (tenantRole !== 'ADMIN' && tenantRole !== 'OWNER') {
      throw ApiError.forbidden('Admin or owner access required');
    }

    ApiResponse.success({ tenant }, 'Tenant settings retrieved').send(res);
  });

  /**
   * @route   PATCH /api/v1/tenants/:tenantId/settings
   * @desc    Update tenant settings
   * @access  Private (Admin/Owner)
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
