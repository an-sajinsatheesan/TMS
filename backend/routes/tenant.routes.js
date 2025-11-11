const express = require('express');
const router = express.Router();
const TenantController = require('../controllers/tenant.controller');
const { authenticate } = require('../middlewares/auth');
const { tenantContext, requireTenantAdmin } = require('../middlewares/membership');
const validate = require('../middlewares/validate');
const tenantValidators = require('../validators/tenant.validator');

/**
 * Tenant Routes
 * Base path: /api/v1/tenants
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(authenticate);

// GET / - Get all tenants for current user
router.get('/', TenantController.getTenants);

// GET /:tenantId/settings - Get tenant settings (requires tenant admin)
router.get('/:tenantId/settings', tenantContext, requireTenantAdmin, TenantController.getSettings);

// PATCH /:tenantId/settings - Update tenant settings (requires tenant admin)
router.patch('/:tenantId/settings', tenantContext, requireTenantAdmin, validate(tenantValidators.updateSettings), TenantController.updateSettings);

// GET /:tenantId/members - Get tenant members
router.get('/:tenantId/members', tenantContext, TenantController.getMembers);

// PATCH /:tenantId/members/:userId - Update member role (requires tenant admin)
router.patch('/:tenantId/members/:userId', tenantContext, requireTenantAdmin, TenantController.updateMemberRole);

// DELETE /:tenantId/members/:userId - Remove member (requires tenant admin)
router.delete('/:tenantId/members/:userId', tenantContext, requireTenantAdmin, TenantController.removeMember);

module.exports = router;
