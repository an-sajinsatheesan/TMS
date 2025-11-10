const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Super Admin Controller
 * Handles system-wide administrative operations
 * Only accessible to users with isSuperAdmin=true
 */

class SuperAdminController {
  /**
   * @route   GET /api/v1/admin/dashboard
   * @desc    Get system-wide dashboard statistics
   * @access  Super Admin Only
   */
  static getDashboardStats = asyncHandler(async (req, res) => {
    // Get counts for all major entities
    const [
      totalUsers,
      totalTenants,
      totalProjects,
      totalTasks,
      globalTemplates,
      pendingInvitations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.tenant.count(),
      prisma.project.count({ where: { deletedAt: null, isTemplate: false } }),
      prisma.task.count(),
      prisma.project.count({ where: { isGlobal: true, isTemplate: true } }),
      prisma.invitation.count({ where: { status: 'PENDING' } }),
    ]);

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    const recentTenants = await prisma.tenant.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    ApiResponse.success(
      {
        totalUsers,
        totalTenants,
        totalProjects,
        totalTasks,
        globalTemplates,
        pendingInvitations,
        recentUsers,
        recentTenants,
      },
      'Dashboard statistics retrieved successfully'
    ).send(res);
  });

  /**
   * @route   GET /api/v1/admin/templates/global
   * @desc    List all global templates
   * @access  Super Admin Only
   */
  static listGlobalTemplates = asyncHandler(async (req, res) => {
    const { category } = req.query;

    const where = {
      isGlobal: true,
      isTemplate: true,
      deletedAt: null,
    };

    if (category && category !== 'ALL') {
      where.templateCategory = category;
    }

    const templates = await prisma.project.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            sections: true,
            tasks: true,
            columns: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    ApiResponse.success(templates, 'Global templates retrieved successfully').send(res);
  });

  /**
   * @route   POST /api/v1/admin/templates/global
   * @desc    Create a new global template
   * @access  Super Admin Only
   */
  static createGlobalTemplate = asyncHandler(async (req, res) => {
    const {
      name,
      description,
      color,
      layout,
      templateCategory,
      sections,
      columns,
    } = req.body;
    const userId = req.user.id;

    if (!name) {
      throw ApiError.badRequest('Template name is required');
    }

    // Create global template with sections and columns
    const template = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#3b82f6',
        layout: layout || 'LIST',
        templateCategory: templateCategory || 'CUSTOM',
        isTemplate: true,
        isGlobal: true,
        tenantId: null, // Global templates have no tenant
        createdBy: userId,
        sections: sections
          ? {
              create: sections.map((section, index) => ({
                name: section.name,
                position: section.position || index,
                color: section.color || '#94a3b8',
              })),
            }
          : undefined,
        columns: columns
          ? {
              create: columns.map((column, index) => ({
                name: column.name,
                type: column.type,
                width: column.width || 150,
                visible: column.visible !== false,
                isDefault: column.isDefault || false,
                position: column.position || index,
                options: column.options || null,
              })),
            }
          : undefined,
      },
      include: {
        sections: true,
        columns: true,
        _count: {
          select: {
            sections: true,
            tasks: true,
            columns: true,
          },
        },
      },
    });

    ApiResponse.success(template, 'Global template created successfully', 201).send(res);
  });

  /**
   * @route   PATCH /api/v1/admin/templates/global/:templateId
   * @desc    Update a global template
   * @access  Super Admin Only
   */
  static updateGlobalTemplate = asyncHandler(async (req, res) => {
    const { templateId } = req.params;
    const { name, description, color, layout, templateCategory } = req.body;

    // Verify it's a global template
    const existingTemplate = await prisma.project.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      throw ApiError.notFound('Template not found');
    }

    if (!existingTemplate.isGlobal) {
      throw ApiError.badRequest('This is not a global template');
    }

    const template = await prisma.project.update({
      where: { id: templateId },
      data: {
        name,
        description,
        color,
        layout,
        templateCategory,
      },
      include: {
        _count: {
          select: {
            sections: true,
            tasks: true,
            columns: true,
          },
        },
      },
    });

    ApiResponse.success(template, 'Global template updated successfully').send(res);
  });

  /**
   * @route   DELETE /api/v1/admin/templates/global/:templateId
   * @desc    Delete a global template
   * @access  Super Admin Only
   */
  static deleteGlobalTemplate = asyncHandler(async (req, res) => {
    const { templateId } = req.params;

    // Verify it's a global template
    const existingTemplate = await prisma.project.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      throw ApiError.notFound('Template not found');
    }

    if (!existingTemplate.isGlobal) {
      throw ApiError.badRequest('This is not a global template');
    }

    // Soft delete
    await prisma.project.update({
      where: { id: templateId },
      data: { deletedAt: new Date() },
    });

    ApiResponse.success(null, 'Global template deleted successfully').send(res);
  });

  /**
   * @route   GET /api/v1/admin/users
   * @desc    List all users with pagination
   * @access  Super Admin Only
   */
  static listUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, search } = req.query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          isEmailVerified: true,
          isSuperAdmin: true,
          authProvider: true,
          createdAt: true,
          _count: {
            select: {
              tenantUsers: true,
              createdProjects: true,
              assignedTasks: true,
            },
          },
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    ApiResponse.success(
      {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
      'Users retrieved successfully'
    ).send(res);
  });

  /**
   * @route   PATCH /api/v1/admin/users/:userId/super-admin
   * @desc    Grant or revoke super admin privileges
   * @access  Super Admin Only
   */
  static toggleSuperAdmin = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { isSuperAdmin } = req.body;

    if (typeof isSuperAdmin !== 'boolean') {
      throw ApiError.badRequest('isSuperAdmin must be a boolean value');
    }

    // Prevent self-demotion
    if (userId === req.user.id && !isSuperAdmin) {
      throw ApiError.badRequest('You cannot revoke your own super admin privileges');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isSuperAdmin },
      select: {
        id: true,
        email: true,
        fullName: true,
        isSuperAdmin: true,
      },
    });

    ApiResponse.success(
      user,
      `Super admin privileges ${isSuperAdmin ? 'granted' : 'revoked'} successfully`
    ).send(res);
  });

  /**
   * @route   GET /api/v1/admin/tenants
   * @desc    List all tenants with pagination
   * @access  Super Admin Only
   */
  static listTenants = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, search } = req.query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          subscriptionPlan: true,
          _count: {
            select: {
              tenantUsers: true,
              projects: true,
            },
          },
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenant.count({ where }),
    ]);

    ApiResponse.success(
      {
        tenants,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
      'Tenants retrieved successfully'
    ).send(res);
  });
}

module.exports = SuperAdminController;
