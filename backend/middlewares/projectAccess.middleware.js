const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to check if user has access to a project
 * Verifies:
 * 1. User is a member of the project (ProjectMember)
 * 2. Project belongs to user's tenant (multi-tenant isolation)
 */
const checkProjectAccess = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  // Get project with tenant info
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      tenantId: true,
    },
  });

  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  // Check if user belongs to project's tenant
  const tenantUser = await prisma.tenantUser.findUnique({
    where: {
      tenantId_userId: {
        tenantId: project.tenantId,
        userId,
      },
    },
  });

  if (!tenantUser) {
    throw ApiError.forbidden('Access denied: You do not belong to this project\'s workspace');
  }

  // Check if user is a member of the project
  const projectMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!projectMember) {
    throw ApiError.forbidden('Access denied: You are not a member of this project');
  }

  // Attach project and member info to request
  req.project = project;
  req.projectMember = projectMember;

  next();
});

/**
 * Middleware to check if user has OWNER or ADMIN role in project
 */
const checkProjectAdmin = asyncHandler(async (req, res, next) => {
  const projectMember = req.projectMember;

  if (!projectMember) {
    throw ApiError.forbidden('Project membership not verified');
  }

  if (projectMember.role !== 'OWNER' && projectMember.role !== 'ADMIN') {
    throw ApiError.forbidden('Access denied: Requires OWNER or ADMIN role');
  }

  next();
});

/**
 * Middleware to check if user has OWNER role in project
 */
const checkProjectOwner = asyncHandler(async (req, res, next) => {
  const projectMember = req.projectMember;

  if (!projectMember) {
    throw ApiError.forbidden('Project membership not verified');
  }

  if (projectMember.role !== 'OWNER') {
    throw ApiError.forbidden('Access denied: Requires OWNER role');
  }

  next();
});

module.exports = {
  checkProjectAccess,
  checkProjectAdmin,
  checkProjectOwner,
};
