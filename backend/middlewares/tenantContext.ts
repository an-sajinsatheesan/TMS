const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Tenant Context Middleware
 * Injects tenant information and user role into request
 * Requires authentication middleware to run first
 */

const tenantContext = asyncHandler(async (req, res, next) => {
  const { tenantId } = req.params;

  if (!tenantId) {
    throw ApiError.badRequest('Tenant ID is required');
  }

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

  // Check if user has access to this tenant
  const tenantUser = await prisma.tenantUser.findUnique({
    where: {
      tenantId_userId: {
        tenantId,
        userId: req.user.id,
      },
    },
  });

  if (!tenantUser) {
    throw ApiError.forbidden('You do not have access to this workspace');
  }

  // Attach tenant and role to request
  req.tenant = tenant;
  req.tenantRole = tenantUser.role;

  next();
});

/**
 * Check if user is admin or owner
 */
const requireAdmin = (req, res, next) => {
  if (!req.tenantRole || (req.tenantRole !== 'ADMIN' && req.tenantRole !== 'OWNER')) {
    throw ApiError.forbidden('Admin or owner access required');
  }
  next();
};

/**
 * Check if user is owner
 */
const requireOwner = (req, res, next) => {
  if (!req.tenantRole || req.tenantRole !== 'OWNER') {
    throw ApiError.forbidden('Owner access required');
  }
  next();
};

module.exports = { tenantContext, requireAdmin, requireOwner };
