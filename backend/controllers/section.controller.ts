const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Section Controller
 * Handles project section CRUD operations
 */

class SectionController {
  /**
   * @route   GET /api/v1/projects/:projectId/sections
   * @desc    List all sections in a project
   * @access  Private (requires ProjectMember)
   */
  static listSections = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const sections = await prisma.projectSection.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        name: true,
        projectId: true,
        color: true,
        position: true,
        isCollapsed: true,
        kanbanWipLimit: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    // Transform to match UI expectations (orderIndex instead of position)
    const transformedSections = sections.map((section) => ({
      id: section.id,
      name: section.name,
      projectId: section.projectId,
      color: section.color,
      orderIndex: section.position,
      isCollapsed: section.isCollapsed,
      kanbanWipLimit: section.kanbanWipLimit,
      taskCount: section._count.tasks,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    }));

    ApiResponse.success(transformedSections, 'Sections retrieved successfully').send(res);
  });

  /**
   * @route   POST /api/v1/projects/:projectId/sections
   * @desc    Create a new section
   * @access  Private (requires ProjectMember)
   */
  static createSection = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { name, color, position } = req.body;

    // If position not provided, add to end
    let finalPosition = position;
    if (finalPosition === undefined || finalPosition === null) {
      const maxPosition = await prisma.projectSection.findFirst({
        where: { projectId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      finalPosition = maxPosition ? maxPosition.position + 1 : 0;
    } else {
      // If position is provided, shift other sections
      await prisma.projectSection.updateMany({
        where: {
          projectId,
          position: {
            gte: finalPosition,
          },
        },
        data: {
          position: {
            increment: 1,
          },
        },
      });
    }

    const section = await prisma.projectSection.create({
      data: {
        projectId,
        name,
        color: color || '#94a3b8',
        position: finalPosition,
      },
      select: {
        id: true,
        name: true,
        projectId: true,
        color: true,
        position: true,
        isCollapsed: true,
        kanbanWipLimit: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Transform response
    const transformedSection = {
      ...section,
      orderIndex: section.position,
    };
    delete transformedSection.position;

    ApiResponse.success(transformedSection, 'Section created successfully').send(res, 201);
  });

  /**
   * @route   PATCH /api/v1/sections/:sectionId
   * @desc    Update a section
   * @access  Private (requires ProjectMember)
   */
  static updateSection = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;
    const { name, color, position, isCollapsed, kanbanWipLimit } = req.body;

    // Check if section exists
    const existingSection = await prisma.projectSection.findUnique({
      where: { id: sectionId },
      select: {
        id: true,
        projectId: true,
        position: true,
      },
    });

    if (!existingSection) {
      throw ApiError.notFound('Section not found');
    }

    // If position is being changed, reorder sections
    if (position !== undefined && position !== existingSection.position) {
      const projectId = existingSection.projectId;
      const oldPosition = existingSection.position;
      const newPosition = position;

      if (newPosition < oldPosition) {
        // Moving up - shift sections down
        await prisma.projectSection.updateMany({
          where: {
            projectId,
            position: {
              gte: newPosition,
              lt: oldPosition,
            },
          },
          data: {
            position: {
              increment: 1,
            },
          },
        });
      } else {
        // Moving down - shift sections up
        await prisma.projectSection.updateMany({
          where: {
            projectId,
            position: {
              gt: oldPosition,
              lte: newPosition,
            },
          },
          data: {
            position: {
              decrement: 1,
            },
          },
        });
      }
    }

    // Update section
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (position !== undefined) updateData.position = position;
    if (isCollapsed !== undefined) updateData.isCollapsed = isCollapsed;
    if (kanbanWipLimit !== undefined) updateData.kanbanWipLimit = kanbanWipLimit;

    const updatedSection = await prisma.projectSection.update({
      where: { id: sectionId },
      data: updateData,
      select: {
        id: true,
        name: true,
        projectId: true,
        color: true,
        position: true,
        isCollapsed: true,
        kanbanWipLimit: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Transform response
    const transformedSection = {
      ...updatedSection,
      orderIndex: updatedSection.position,
    };
    delete transformedSection.position;

    ApiResponse.success(transformedSection, 'Section updated successfully').send(res);
  });

  /**
   * @route   DELETE /api/v1/sections/:sectionId
   * @desc    Delete a section
   * @access  Private (requires ProjectMember)
   */
  static deleteSection = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;

    // Check if section exists
    const section = await prisma.projectSection.findUnique({
      where: { id: sectionId },
      select: {
        id: true,
        projectId: true,
        position: true,
      },
    });

    if (!section) {
      throw ApiError.notFound('Section not found');
    }

    // Move tasks to null section (or you could move to first section)
    await prisma.task.updateMany({
      where: { sectionId },
      data: { sectionId: null },
    });

    // Delete section
    await prisma.projectSection.delete({
      where: { id: sectionId },
    });

    // Reorder remaining sections
    await prisma.$executeRaw`
      UPDATE project_sections
      SET position = position - 1
      WHERE "projectId" = ${section.projectId}::uuid
      AND position > ${section.position}
    `;

    ApiResponse.success(null, 'Section deleted successfully').send(res);
  });

  /**
   * @route   POST /api/v1/projects/:projectId/sections/reorder
   * @desc    Reorder sections
   * @access  Private (requires ProjectMember)
   */
  static reorderSections = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { sectionIds } = req.body;

    // Verify all sections belong to this project
    const sections = await prisma.projectSection.findMany({
      where: {
        id: { in: sectionIds },
        projectId,
      },
      select: { id: true },
    });

    if (sections.length !== sectionIds.length) {
      throw ApiError.badRequest('Some sections do not belong to this project');
    }

    // Update positions in transaction
    await prisma.$transaction(
      sectionIds.map((sectionId, index) =>
        prisma.projectSection.update({
          where: { id: sectionId },
          data: { position: index },
        })
      )
    );

    // Fetch updated sections
    const updatedSections = await prisma.projectSection.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        name: true,
        projectId: true,
        color: true,
        position: true,
        isCollapsed: true,
        kanbanWipLimit: true,
      },
    });

    // Transform response
    const transformedSections = updatedSections.map((section) => ({
      ...section,
      orderIndex: section.position,
    }));

    ApiResponse.success(transformedSections, 'Sections reordered successfully').send(res);
  });
}

module.exports = SectionController;
