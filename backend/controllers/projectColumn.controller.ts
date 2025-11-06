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
    const updateData = { ...req.body };

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

    if (!Array.isArray(columnIds)) {
      throw ApiError.badRequest('columnIds must be an array');
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
