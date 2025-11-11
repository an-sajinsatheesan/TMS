const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Project Column Controller
 * Handles custom column CRUD operations for projects
 */

class ProjectColumnController {
  /**
   * @route   GET /api/v1/projects/:projectId/columns
   * @desc    Get all columns for a project
   * @access  Private (requires ProjectMember)
   */
  static listColumns = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const columns = await prisma.projectColumn.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });

    ApiResponse.success(columns, 'Columns retrieved successfully').send(res);
  });

  /**
   * @route   POST /api/v1/projects/:projectId/columns
   * @desc    Create a new column
   * @access  Private (requires ProjectMember with ADMIN or OWNER role)
   */
  static createColumn = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { name, type, width, visible, options } = req.body;
    const userId = req.user.id;

    // Get project and verify it exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, tenantId: true },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // Check if user has admin access (project-level or tenant-level membership)
    let membership = await prisma.project_members.findFirst({
      where: {
        userId,
        projectId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!membership) {
      // Check tenant-level membership
      membership = await prisma.tenant_users.findFirst({
        where: {
          userId,
          tenantId: project.tenantId,
        },
        select: {
          id: true,
          role: true,
        },
      });
    }

    if (!membership) {
      throw ApiError.forbidden('Access denied: You are not a member of this project');
    }

    // Check for admin role (OWNER or ADMIN)
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw ApiError.forbidden('Access denied: Requires ADMIN role');
    }

    // Get the next position
    const lastColumn = await prisma.projectColumn.findFirst({
      where: { projectId },
      orderBy: { position: 'desc' },
    });

    const position = lastColumn ? lastColumn.position + 1 : 0;

    const column = await prisma.projectColumn.create({
      data: {
        projectId,
        name,
        type,
        width: width || 150,
        visible: visible !== undefined ? visible : true,
        position,
        options: options || null,
      },
    });

    ApiResponse.success(column, 'Column created successfully').send(res, 201);
  });

  /**
   * @route   PATCH /api/v1/projects/:projectId/columns/:columnId
   * @desc    Update a column
   * @access  Private (requires ProjectMember with ADMIN or OWNER role)
   */
  static updateColumn = asyncHandler(async (req, res) => {
    const { columnId } = req.params;
    const userId = req.user.id;
    const updateData = { ...req.body };

    // Get column and verify it exists
    const existingColumn = await prisma.projectColumn.findUnique({
      where: { id: columnId },
      select: {
        id: true,
        projectId: true,
        project: {
          select: {
            tenantId: true,
          },
        },
      },
    });

    if (!existingColumn) {
      throw ApiError.notFound('Column not found');
    }

    // Check if user has admin access (project-level or tenant-level membership)
    let membership = await prisma.project_members.findFirst({
      where: {
        userId,
        projectId: existingColumn.projectId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!membership) {
      // Check tenant-level membership
      membership = await prisma.tenant_users.findFirst({
        where: {
          userId,
          tenantId: existingColumn.project.tenantId,
        },
        select: {
          id: true,
          role: true,
        },
      });
    }

    if (!membership) {
      throw ApiError.forbidden('Access denied: You are not a member of this project');
    }

    // Check for admin role (OWNER or ADMIN)
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw ApiError.forbidden('Access denied: Requires ADMIN role');
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.projectId;
    delete updateData.createdAt;

    const column = await prisma.projectColumn.update({
      where: { id: columnId },
      data: updateData,
    });

    ApiResponse.success(column, 'Column updated successfully').send(res);
  });

  /**
   * @route   DELETE /api/v1/projects/:projectId/columns/:columnId
   * @desc    Delete a column
   * @access  Private (requires ProjectMember with ADMIN or OWNER role)
   */
  static deleteColumn = asyncHandler(async (req, res) => {
    const { columnId } = req.params;
    const userId = req.user.id;

    // Check if column is a default column
    const column = await prisma.projectColumn.findUnique({
      where: { id: columnId },
      select: {
        id: true,
        projectId: true,
        isDefault: true,
        project: {
          select: {
            tenantId: true,
          },
        },
      },
    });

    if (!column) {
      throw ApiError.notFound('Column not found');
    }

    // Check if user has admin access (project-level or tenant-level membership)
    let membership = await prisma.project_members.findFirst({
      where: {
        userId,
        projectId: column.projectId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!membership) {
      // Check tenant-level membership
      membership = await prisma.tenant_users.findFirst({
        where: {
          userId,
          tenantId: column.project.tenantId,
        },
        select: {
          id: true,
          role: true,
        },
      });
    }

    if (!membership) {
      throw ApiError.forbidden('Access denied: You are not a member of this project');
    }

    // Check for admin role (OWNER or ADMIN)
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw ApiError.forbidden('Access denied: Requires ADMIN role');
    }

    if (column.isDefault) {
      throw ApiError.badRequest('Cannot delete default columns. You can only hide them.');
    }

    await prisma.projectColumn.delete({
      where: { id: columnId },
    });

    ApiResponse.success(null, 'Column deleted successfully').send(res);
  });

  /**
   * @route   PATCH /api/v1/projects/:projectId/columns/reorder
   * @desc    Reorder columns
   * @access  Private (requires ProjectMember with ADMIN or OWNER role)
   */
  static reorderColumns = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { columnIds } = req.body; // Array of column IDs in new order
    const userId = req.user.id;

    if (!Array.isArray(columnIds)) {
      throw ApiError.badRequest('columnIds must be an array');
    }

    // Get project and verify it exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, tenantId: true },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // Check if user has admin access (project-level or tenant-level membership)
    let membership = await prisma.project_members.findFirst({
      where: {
        userId,
        projectId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!membership) {
      // Check tenant-level membership
      membership = await prisma.tenant_users.findFirst({
        where: {
          userId,
          tenantId: project.tenantId,
        },
        select: {
          id: true,
          role: true,
        },
      });
    }

    if (!membership) {
      throw ApiError.forbidden('Access denied: You are not a member of this project');
    }

    // Check for admin role (OWNER or ADMIN)
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw ApiError.forbidden('Access denied: Requires ADMIN role');
    }

    // Update positions in a transaction
    await prisma.$transaction(
      columnIds.map((columnId, index) =>
        prisma.projectColumn.update({
          where: { id: columnId },
          data: { position: index },
        })
      )
    );

    const updatedColumns = await prisma.projectColumn.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });

    ApiResponse.success(updatedColumns, 'Columns reordered successfully').send(res);
  });
}

module.exports = ProjectColumnController;
