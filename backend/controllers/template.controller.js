const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all global templates (browsing for project creation)
 * @route   GET /api/templates
 * @access  Private (any authenticated user)
 */
const listTemplates = asyncHandler(async (req, res) => {
  const { category, search, layout } = req.query;

  const where = {
    isGlobal: true,
  };

  if (category && category !== 'all') {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (layout) {
    where.layout = layout;
  }

  const templates = await prisma.template.findMany({
    where,
    include: {
      sections: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          name: true,
          position: true,
          color: true,
        },
      },
      columns: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          name: true,
          type: true,
          position: true,
        },
      },
      _count: {
        select: {
          clonedProjects: true,
        },
      },
    },
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ],
  });

  res.json({
    success: true,
    data: templates,
  });
});

/**
 * @desc    Get template details by ID
 * @route   GET /api/templates/:templateId
 * @access  Private
 */
const getTemplateById = asyncHandler(async (req, res) => {
  const { templateId } = req.params;

  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: {
      sections: {
        orderBy: { position: 'asc' },
        include: {
          tasks: {
            orderBy: { position: 'asc' },
          },
        },
      },
      columns: {
        orderBy: { position: 'asc' },
      },
      creator: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          clonedProjects: true,
        },
      },
    },
  });

  if (!template) {
    throw ApiError.notFound('Template not found');
  }

  // Only global templates or super admin can view
  if (!template.isGlobal && req.user.systemRole !== 'SUPER_ADMIN') {
    throw ApiError.forbidden('Access denied to this template');
  }

  res.json({
    success: true,
    data: template,
  });
});

/**
 * @desc    Create new global template (Super Admin only)
 * @route   POST /api/templates
 * @access  Super Admin
 */
const createTemplate = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    color,
    layout,
    category,
    icon,
    thumbnail,
    sections,
    columns,
  } = req.body;

  // Validate required fields
  if (!name || !layout) {
    throw ApiError.badRequest('Name and layout are required');
  }

  // Create template with sections and columns
  const template = await prisma.template.create({
    data: {
      name,
      description,
      color: color || '#3b82f6',
      layout,
      category: category || 'CUSTOM',
      icon,
      thumbnail,
      isGlobal: true,
      createdBy: req.user.id,
      sections: sections
        ? {
            create: sections.map((section, index) => ({
              name: section.name,
              description: section.description,
              position: section.position ?? index,
              color: section.color || '#94a3b8',
              icon: section.icon,
              tasks: section.tasks
                ? {
                    create: section.tasks.map((task, taskIndex) => ({
                      title: task.title,
                      description: task.description,
                      type: task.type || 'TASK',
                      position: task.position ?? taskIndex,
                      priority: task.priority,
                      status: task.status,
                      tags: task.tags || [],
                    })),
                  }
                : undefined,
            })),
          }
        : undefined,
      columns: columns
        ? {
            create: columns.map((column, index) => ({
              name: column.name,
              type: column.type,
              width: column.width || 150,
              position: column.position ?? index,
              options: column.options,
              isDefault: column.isDefault || false,
            })),
          }
        : undefined,
    },
    include: {
      sections: {
        include: {
          tasks: true,
        },
      },
      columns: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Template created successfully',
    data: template,
  });
});

/**
 * @desc    Update global template (Super Admin only)
 * @route   PUT /api/templates/:templateId
 * @access  Super Admin
 */
const updateTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const { name, description, color, layout, category, icon, thumbnail } =
    req.body;

  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw ApiError.notFound('Template not found');
  }

  if (!template.isGlobal) {
    throw ApiError.forbidden('Can only update global templates');
  }

  const updatedTemplate = await prisma.template.update({
    where: { id: templateId },
    data: {
      name,
      description,
      color,
      layout,
      category,
      icon,
      thumbnail,
    },
    include: {
      sections: {
        orderBy: { position: 'asc' },
      },
      columns: {
        orderBy: { position: 'asc' },
      },
    },
  });

  res.json({
    success: true,
    message: 'Template updated successfully',
    data: updatedTemplate,
  });
});

/**
 * @desc    Delete global template (Super Admin only)
 * @route   DELETE /api/templates/:templateId
 * @access  Super Admin
 */
const deleteTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;

  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: {
      _count: {
        select: {
          clonedProjects: true,
        },
      },
    },
  });

  if (!template) {
    throw ApiError.notFound('Template not found');
  }

  if (!template.isGlobal) {
    throw ApiError.forbidden('Can only delete global templates');
  }

  // Check if template has been used
  if (template._count.clonedProjects > 0) {
    throw ApiError.badRequest(
      `Cannot delete template: ${template._count.clonedProjects} project(s) were created from this template`
    );
  }

  await prisma.template.delete({
    where: { id: templateId },
  });

  res.json({
    success: true,
    message: 'Template deleted successfully',
  });
});

/**
 * @desc    Get template categories with counts
 * @route   GET /api/templates/categories/stats
 * @access  Private
 */
const getTemplateCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.template.groupBy({
    by: ['category'],
    where: {
      isGlobal: true,
    },
    _count: true,
  });

  const categoryStats = categories.map((cat) => ({
    category: cat.category,
    count: cat._count,
  }));

  res.json({
    success: true,
    data: categoryStats,
  });
});

/**
 * @desc    Clone template to create a new project
 * @route   POST /api/templates/:templateId/clone
 * @access  Private (handled in project controller)
 * @note    This is typically called from project.controller.js createProject
 */
const cloneTemplateToProject = async (templateId, projectData, transaction) => {
  const prismaClient = transaction || prisma;

  // Get template with all sections, tasks, and columns
  const template = await prismaClient.template.findUnique({
    where: { id: templateId },
    include: {
      sections: {
        include: {
          tasks: {
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
      columns: {
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!template) {
    throw ApiError.notFound('Template not found');
  }

  // Create project with template structure
  const project = await prismaClient.project.create({
    data: {
      ...projectData,
      templateId: template.id,
      color: projectData.color || template.color,
      layout: projectData.layout || template.layout,
      sections: {
        create: template.sections.map((section) => ({
          name: section.name,
          position: section.position,
          color: section.color,
          tasks: {
            create: section.tasks.map((task) => ({
              title: task.title,
              description: task.description,
              type: task.type,
              position: task.position,
              priority: task.priority,
              status: task.status,
              tags: task.tags,
              tenantId: projectData.tenantId,
              createdBy: projectData.createdBy,
            })),
          },
        })),
      },
      columns: {
        create: template.columns.map((column) => ({
          name: column.name,
          type: column.type,
          width: column.width,
          position: column.position,
          options: column.options,
          isDefault: column.isDefault,
        })),
      },
    },
    include: {
      sections: {
        include: {
          tasks: true,
        },
      },
      columns: true,
    },
  });

  return project;
};

module.exports = {
  listTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateCategories,
  cloneTemplateToProject,
};
