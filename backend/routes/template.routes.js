const express = require('express');
const router = express.Router();
const {
  listTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateCategories,
} = require('../controllers/template.controller');
const { protect } = require('../middlewares/auth');
const { requireSuperAdmin } = require('../middlewares/superAdmin');

// Public routes (require authentication)
router.use(protect);

// List all global templates
router.get('/', listTemplates);

// Get template categories with counts
router.get('/categories/stats', getTemplateCategories);

// Get template by ID
router.get('/:templateId', getTemplateById);

// Super Admin only routes
router.post('/', requireSuperAdmin, createTemplate);
router.put('/:templateId', requireSuperAdmin, updateTemplate);
router.delete('/:templateId', requireSuperAdmin, deleteTemplate);

module.exports = router;
