const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :projectId from parent router
const ProjectColumnController = require('../controllers/projectColumn.controller');
const { validate } = require('../validators/projectColumn.validator');
const {
  createColumnSchema,
  updateColumnSchema,
  reorderColumnsSchema,
} = require('../validators/projectColumn.validator');
const { authenticate } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/projects/:projectId/columns
 * @desc    Get all columns for a project
 * @access  Private
 */
router.get('/', ProjectColumnController.listColumns);

/**
 * @route   POST /api/v1/projects/:projectId/columns
 * @desc    Create a new column
 * @access  Private
 */
router.post('/', validate(createColumnSchema), ProjectColumnController.createColumn);

/**
 * @route   PATCH /api/v1/projects/:projectId/columns/reorder
 * @desc    Reorder columns
 * @access  Private
 * @note    MUST be defined before /:columnId route
 */
router.patch('/reorder', validate(reorderColumnsSchema), ProjectColumnController.reorderColumns);

/**
 * @route   PATCH /api/v1/projects/:projectId/columns/:columnId
 * @desc    Update a column
 * @access  Private
 */
router.patch('/:columnId', validate(updateColumnSchema), ProjectColumnController.updateColumn);

/**
 * @route   DELETE /api/v1/projects/:projectId/columns/:columnId
 * @desc    Delete a column
 * @access  Private
 */
router.delete('/:columnId', ProjectColumnController.deleteColumn);

module.exports = router;
