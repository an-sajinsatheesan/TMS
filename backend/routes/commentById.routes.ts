const express = require('express');
const router = express.Router();
const TaskCommentController = require('../controllers/taskComment.controller');
const { authenticate } = require('../middlewares/auth');

/**
 * Comment By ID Routes
 * Base path: /api/v1/comments
 */

/**
 * @route   DELETE /api/v1/comments/:commentId
 * @desc    Delete a comment
 * @access  Private (comment author or project admin)
 */
router.delete('/:commentId', authenticate, TaskCommentController.deleteComment);

module.exports = router;
