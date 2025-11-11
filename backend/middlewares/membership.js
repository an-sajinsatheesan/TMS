const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Role Hierarchy (from highest to lowest)
 * SUPER_ADMIN > OWNER > ADMIN > MEMBER > VIEWER
 *
 * Note: OWNER and ADMIN apply to both tenant-level and project-level roles
 * Tenant OWNER/ADMIN automatically have full access to all tenant projects
 */
const ROLE_HIERARCHY = {
  SUPER_ADMIN: 6,
  OWNER: 5,
  ADMIN: 4,
  MEMBER: 3,
  VIEWER: 2,
};

/**
 * Check if user has at least the minimum required role
 */
function hasMinimumRole(userRole, requiredRole) {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Tenant Context Middleware
 * Verifies user has access to tenant and attaches tenant + membership info
 * Requires authentication middleware to run first
 */
const tenantContext = asyncHandler(async (req, res, next) => {
  const { tenantId } = req.params;

  if (!tenantId) {
    throw ApiError.badRequest('Tenant ID is required');
  }

  // Check if user is SUPER_ADMIN (has access to all tenants)
  const isSuperAdmin = req.user.systemRole === 'SUPER_ADMIN';

  // Get tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      subscriptionPlan: true,
    },
  });

  if (!tenant) {
    throw ApiError.notFound('Tenant not found');
  }

  // Super admins bypass membership check
  if (isSuperAdmin) {
    req.tenant = tenant;
    req.tenantRole = 'SUPER_ADMIN';
    req.membership = null;
    return next();
  }

  // Check if user has tenant-level membership
  const membership = await prisma.tenant_users.findFirst({
    where: {
      userId: req.user.id,
      tenantId,
    },
  });

  if (!membership) {
    throw ApiError.forbidden('You do not have access to this workspace');
  }

  // Attach tenant and membership to request
  req.tenant = tenant;
  req.tenantRole = membership.role;
  req.membership = membership;

  next();
});

/**
 * Project Context Middleware
 * Verifies user has access to project and attaches project + membership info
 * Should be used after tenantContext or independently
 */
const projectContext = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  if (!projectId) {
    throw ApiError.badRequest('Project ID is required');
  }

  // Get project with tenant info
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tenant: {
        include: {
          subscriptionPlan: true,
        },
      },
    },
  });

  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  // Check soft delete
  if (project.deletedAt) {
    throw ApiError.notFound('Project has been deleted');
  }

  // Check if user is SUPER_ADMIN (has access to all projects)
  const isSuperAdmin = req.user.systemRole === 'SUPER_ADMIN';

  if (isSuperAdmin) {
    req.project = project;
    req.tenant = project.tenant;
    req.projectRole = 'SUPER_ADMIN';
    req.tenantRole = 'SUPER_ADMIN';
    req.membership = null;
    return next();
  }

  // Check for tenant-level membership (grants access to all projects in tenant)
  const tenantMembership = await prisma.tenant_users.findFirst({
    where: {
      userId,
      tenantId: project.tenantId,
    },
  });

  if (tenantMembership) {
    // Tenant-level membership grants access to all projects
    req.project = project;
    req.tenant = project.tenant;
    req.projectRole = tenantMembership.role;
    req.tenantRole = tenantMembership.role;
    req.membership = tenantMembership;
    return next();
  }

  // Check for project-specific membership
  const projectMembership = await prisma.project_members.findFirst({
    where: {
      userId,
      projectId,
    },
  });

  if (!projectMembership) {
    throw ApiError.forbidden('You do not have access to this project');
  }

  // Attach project and membership info to request
  req.project = project;
  req.tenant = project.tenant;
  req.projectRole = projectMembership.role;
  req.membership = projectMembership;

  // Also check tenant membership for tenant-level operations
  const anyTenantMembership = await prisma.tenant_users.findFirst({
    where: {
      userId,
      tenantId: project.tenantId,
    },
  });

  req.tenantRole = anyTenantMembership?.role || null;

  next();
});

/**
 * Require minimum role for tenant-level operations
 * Usage: requireTenantRole('ADMIN')
 */
const requireTenantRole = (minRole) => {
  return (req, res, next) => {
    if (!req.tenantRole) {
      throw ApiError.forbidden('Tenant membership required');
    }

    if (!hasMinimumRole(req.tenantRole, minRole)) {
      throw ApiError.forbidden(
        `Access denied: Requires ${minRole} role or higher`
      );
    }

    next();
  };
};

/**
 * Require minimum role for project-level operations
 * Usage: requireProjectRole('ADMIN')
 * Note: Tenant-level roles (OWNER/ADMIN) automatically grant project access
 */
const requireProjectRole = (minRole) => {
  return (req, res, next) => {
    if (!req.projectRole) {
      throw ApiError.forbidden('Project membership required');
    }

    if (!hasMinimumRole(req.projectRole, minRole)) {
      throw ApiError.forbidden(
        `Access denied: Requires ${minRole} role or higher`
      );
    }

    next();
  };
};

/**
 * Shortcut middlewares for common role requirements
 */
const requireTenantAdmin = requireTenantRole('ADMIN');
const requireProjectAdmin = requireProjectRole('ADMIN');
const requireProjectMember = requireProjectRole('MEMBER');

/**
 * Check if user can manage another member
 * Rules:
 * - SUPER_ADMIN can manage anyone
 * - Tenant OWNER/ADMIN can manage anyone in their tenant (except SUPER_ADMIN)
 * - Project OWNER/ADMIN can manage MEMBER and VIEWER in their project
 * - Cannot manage users with equal or higher role
 */
const canManageMember = (managerRole, targetRole) => {
  if (managerRole === 'SUPER_ADMIN') return true;
  if (targetRole === 'SUPER_ADMIN') return false;
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
};

/**
 * Verify user can manage target member
 */
const requireCanManageMember = asyncHandler(async (req, res, next) => {
  const { memberId, userId } = req.params;
  const managerId = req.user.id;

  // Get target member's role
  let targetMembership;

  if (memberId) {
    // Try project_members first, then tenant_users
    targetMembership = await prisma.project_members.findUnique({
      where: { id: memberId },
    });

    if (!targetMembership) {
      targetMembership = await prisma.tenant_users.findUnique({
        where: { id: memberId },
      });
    }
  } else if (userId) {
    // Find membership by userId in context of current project/tenant
    if (req.project) {
      targetMembership = await prisma.project_members.findFirst({
        where: { userId, projectId: req.project.id },
      });
    } else {
      targetMembership = await prisma.tenant_users.findFirst({
        where: { userId, tenantId: req.tenant.id },
      });
    }
  }

  if (!targetMembership) {
    throw ApiError.notFound('Member not found');
  }

  // Cannot manage yourself
  if (targetMembership.userId === managerId) {
    throw ApiError.badRequest('Cannot manage your own membership');
  }

  // Check if manager has permission
  const managerRole = req.projectRole || req.tenantRole;

  if (!canManageMember(managerRole, targetMembership.role)) {
    throw ApiError.forbidden('Insufficient permissions to manage this member');
  }

  req.targetMembership = targetMembership;
  next();
});

/**
 * Check if user is project creator/owner
 */
const requireProjectOwner = asyncHandler(async (req, res, next) => {
  if (!req.project) {
    throw ApiError.badRequest('Project context required');
  }

  const isSuperAdmin = req.user.systemRole === 'SUPER_ADMIN';
  const isCreator = req.project.createdBy === req.user.id;
  const isTenantAdmin = req.tenantRole === 'ADMIN' || req.tenantRole === 'OWNER';

  if (!isSuperAdmin && !isCreator && !isTenantAdmin) {
    throw ApiError.forbidden('Only project owner, tenant admin, or super admin can perform this action');
  }

  next();
});

module.exports = {
  tenantContext,
  projectContext,
  requireTenantRole,
  requireProjectRole,
  requireTenantAdmin,
  requireProjectAdmin,
  requireProjectMember,
  requireCanManageMember,
  requireProjectOwner,
  canManageMember,
  hasMinimumRole,
  ROLE_HIERARCHY,
};
