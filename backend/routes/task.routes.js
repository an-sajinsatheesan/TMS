const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable access to :projectId from parent router
const TaskController = require('../controllers/task.controller');
const { authenticate } = require('../middlewares/auth');
const { checkProjectAccess } = require('../middlewares/projectAccess.middleware');
const {
  validate,
  validateQuery,
  createTaskSchema,
  listTasksSchema,
} = require('../validators/task.validator');

/**
 * Task Routes
 * Base path: /api/v1/projects/:projectId/tasks
 */

/**
 * @route   GET /api/v1/projects/:projectId/tasks
 * @desc    List tasks in a project
 * @access  Private (requires ProjectMember)
 */
router.get(
  '/',
  authenticate,
  checkProjectAccess,
  validateQuery(listTasksSchema),
  TaskController.listTasks
);

/**
 * @route   POST /api/v1/projects/:projectId/tasks
 * @desc    Create a new task
 * @access  Private (requires ProjectMember)
 */
router.post(
  '/',
  authenticate,
  checkProjectAccess,
  validate(createTaskSchema),
  TaskController.createTask
);

module.exports = router;
