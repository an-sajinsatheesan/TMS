const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable access to :taskId from parent router
const TaskCommentController = require('../controllers/taskComment.controller');
const { authenticate } = require('../middlewares/auth');
const { validate, createCommentSchema } = require('../validators/taskComment.validator');

/**
 * Task Comment Routes
 * Base path: /api/v1/tasks/:taskId/comments
 */

/**
 * @route   GET /api/v1/tasks/:taskId/comments
 * @desc    Get all comments for a task
 * @access  Private
 */
router.get('/', authenticate, TaskCommentController.getComments);

/**
 * @route   POST /api/v1/tasks/:taskId/comments
 * @desc    Add a comment to a task
 * @access  Private
 */
router.post('/', authenticate, validate(createCommentSchema), TaskCommentController.addComment);

module.exports = router;
