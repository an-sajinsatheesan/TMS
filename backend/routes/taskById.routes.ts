const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');
const { authenticate } = require('../middlewares/auth');
const {
  validate,
  updateTaskSchema,
  moveTaskSchema,
} = require('../validators/task.validator');
const { validate: validateComment, createCommentSchema } = require('../validators/taskComment.validator');

/**
 * Task By ID Routes
 * Base path: /api/v1/tasks
 */

/**
 * @route   GET /api/v1/tasks/:taskId
 * @desc    Get single task with full details
 * @access  Private
 */
router.get('/:taskId', authenticate, TaskController.getTask);

/**
 * @route   PATCH /api/v1/tasks/:taskId
 * @desc    Update a task
 * @access  Private
 */
router.patch('/:taskId', authenticate, validate(updateTaskSchema), TaskController.updateTask);

/**
 * @route   DELETE /api/v1/tasks/:taskId
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:taskId', authenticate, TaskController.deleteTask);

/**
 * @route   POST /api/v1/tasks/:taskId/move
 * @desc    Move task to different section
 * @access  Private
 */
router.post('/:taskId/move', authenticate, validate(moveTaskSchema), TaskController.moveTask);

/**
 * @route   POST /api/v1/tasks/:taskId/duplicate
 * @desc    Duplicate a task
 * @access  Private
 */
router.post('/:taskId/duplicate', authenticate, TaskController.duplicateTask);

/**
 * @route   POST /api/v1/tasks/:taskId/subtasks
 * @desc    Create a subtask
 * @access  Private
 */
router.post('/:taskId/subtasks', authenticate, TaskController.createSubtask);

/**
 * @route   GET /api/v1/tasks/:taskId/comments
 * @route   POST /api/v1/tasks/:taskId/comments
 * @desc    Task comment routes
 * @access  Private
 */
const taskCommentRoutes = require('./taskComment.routes');
router.use('/:taskId/comments', taskCommentRoutes);

module.exports = router;
