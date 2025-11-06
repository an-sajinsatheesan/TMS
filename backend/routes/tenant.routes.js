const express = require('express');
const router = express.Router();
const TenantController = require('../controllers/tenant.controller');
const { authenticate } = require('../middlewares/auth');
const { tenantContext, requireAdmin } = require('../middlewares/tenantContext');
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

// GET /:tenantId/settings - Get tenant settings (requires admin/owner)
router.get('/:tenantId/settings', tenantContext, requireAdmin, TenantController.getSettings);

// PATCH /:tenantId/settings - Update tenant settings (requires admin/owner)
router.patch('/:tenantId/settings', tenantContext, requireAdmin, validate(tenantValidators.updateSettings), TenantController.updateSettings);

module.exports = router;
