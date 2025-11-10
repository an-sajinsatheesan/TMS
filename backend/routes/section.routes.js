const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable access to :projectId from parent router
const SectionController = require('../controllers/section.controller');
const { authenticate } = require('../middlewares/auth');
const { projectContext } = require('../middlewares/membership');
const {
  validate,
  createSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
} = require('../validators/section.validator');

/**
 * Section Routes
 * Base path: /api/v1/projects/:projectId/sections
 */

/**
 * @route   GET /api/v1/projects/:projectId/sections
 * @desc    List all sections in a project
 * @access  Private (requires ProjectMember)
 */
router.get('/', authenticate, projectContext, SectionController.listSections);

/**
 * @route   POST /api/v1/projects/:projectId/sections
 * @desc    Create a new section
 * @access  Private (requires ProjectMember)
 */
router.post(
  '/',
  authenticate,
  projectContext,
  validate(createSectionSchema),
  SectionController.createSection
);

/**
 * @route   POST /api/v1/projects/:projectId/sections/reorder
 * @desc    Reorder sections
 * @access  Private (requires ProjectMember)
 */
router.post(
  '/reorder',
  authenticate,
  projectContext,
  validate(reorderSectionsSchema),
  SectionController.reorderSections
);

/**
 * @route   PATCH /api/v1/sections/:sectionId
 * @desc    Update a section
 * @access  Private (requires ProjectMember)
 * Note: This route is mounted separately at /api/v1/sections
 */

/**
 * @route   DELETE /api/v1/sections/:sectionId
 * @desc    Delete a section
 * @access  Private (requires ProjectMember)
 * Note: This route is mounted separately at /api/v1/sections
 */

module.exports = router;
