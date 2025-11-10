const express = require('express');
const router = express.Router();
const SuperAdminController = require('../controllers/superAdmin.controller');
const { authenticate } = require('../middlewares/auth');
const { requireSuperAdmin } = require('../middlewares/superAdmin');

/**
 * Super Admin Routes
 * Base path: /api/v1/admin
 * All routes require super admin privileges
 */

// Apply authentication and super admin check to all routes
router.use(authenticate);
router.use(requireSuperAdmin);

// ============================================
// Dashboard & Analytics
// ============================================

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get system-wide dashboard statistics
 * @access  Super Admin Only
 */
router.get('/dashboard', SuperAdminController.getDashboardStats);

// ============================================
// Global Template Management
// ============================================

/**
 * @route   GET /api/v1/admin/templates/global
 * @desc    List all global templates
 * @access  Super Admin Only
 */
router.get('/templates/global', SuperAdminController.listGlobalTemplates);

/**
 * @route   POST /api/v1/admin/templates/global
 * @desc    Create a new global template
 * @access  Super Admin Only
 */
router.post('/templates/global', SuperAdminController.createGlobalTemplate);

/**
 * @route   PATCH /api/v1/admin/templates/global/:templateId
 * @desc    Update a global template
 * @access  Super Admin Only
 */
router.patch('/templates/global/:templateId', SuperAdminController.updateGlobalTemplate);

/**
 * @route   DELETE /api/v1/admin/templates/global/:templateId
 * @desc    Delete a global template
 * @access  Super Admin Only
 */
router.delete('/templates/global/:templateId', SuperAdminController.deleteGlobalTemplate);

// ============================================
// User Management
// ============================================

/**
 * @route   GET /api/v1/admin/users
 * @desc    List all users with pagination
 * @access  Super Admin Only
 */
router.get('/users', SuperAdminController.listUsers);

/**
 * @route   PATCH /api/v1/admin/users/:userId/super-admin
 * @desc    Grant or revoke super admin privileges
 * @access  Super Admin Only
 */
router.patch('/users/:userId/super-admin', SuperAdminController.toggleSuperAdmin);

// ============================================
// Tenant Management
// ============================================

/**
 * @route   GET /api/v1/admin/tenants
 * @desc    List all tenants with pagination
 * @access  Super Admin Only
 */
router.get('/tenants', SuperAdminController.listTenants);

module.exports = router;
