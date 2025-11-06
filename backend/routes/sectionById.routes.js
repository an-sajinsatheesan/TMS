const express = require('express');
const router = express.Router();
const SectionController = require('../controllers/section.controller');
const { authenticate } = require('../middlewares/auth');
const {
  validate,
  updateSectionSchema,
} = require('../validators/section.validator');

/**
 * Section By ID Routes
 * Base path: /api/v1/sections
 */

/**
 * @route   PATCH /api/v1/sections/:sectionId
 * @desc    Update a section
 * @access  Private
 */
router.patch(
  '/:sectionId',
  authenticate,
  validate(updateSectionSchema),
  SectionController.updateSection
);

/**
 * @route   DELETE /api/v1/sections/:sectionId
 * @desc    Delete a section
 * @access  Private
 */
router.delete('/:sectionId', authenticate, SectionController.deleteSection);

module.exports = router;
