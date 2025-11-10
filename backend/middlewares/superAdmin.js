const ApiError = require('../utils/ApiError');

/**
 * Super Admin Middleware
 * Restricts access to super admin users only
 * Super admins can:
 * - Manage global templates
 * - View system-wide analytics
 * - Manage subscription plans
 * - Access admin dashboard
 */

/**
 * Check if user is a super admin
 * Must be used after authenticate() middleware
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (!req.user.isSuperAdmin) {
    throw ApiError.forbidden(
      'Access denied: Super admin privileges required. ' +
      'Contact your system administrator for access.'
    );
  }

  next();
};

/**
 * Check if user is either a super admin OR tenant owner
 * Useful for operations that both super admins and tenant owners can perform
 */
const requireSuperAdminOrTenantOwner = async (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  // If super admin, allow immediately
  if (req.user.isSuperAdmin) {
    req.isSuperAdmin = true;
    return next();
  }

  // Check if user is a tenant owner
  if (req.tenantRole === 'OWNER') {
    req.isTenantOwner = true;
    return next();
  }

  throw ApiError.forbidden(
    'Access denied: Requires super admin or tenant owner privileges'
  );
};

/**
 * Attach super admin status to request
 * Useful for conditional logic in controllers
 */
const attachSuperAdminStatus = (req, res, next) => {
  if (req.user) {
    req.isSuperAdmin = req.user.isSuperAdmin || false;
  }
  next();
};

module.exports = {
  requireSuperAdmin,
  requireSuperAdminOrTenantOwner,
  attachSuperAdminStatus,
};
