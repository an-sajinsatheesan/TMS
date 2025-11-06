const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * TaskComment Controller
 * Handles task comment operations
 */

class TaskCommentController {
  /**
   * @route   GET /api/v1/tasks/:taskId/comments
   * @desc    Get all comments for a task
   * @access  Private
   */
  static getComments = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Transform to match UI expectations
    const transformedComments = comments.map((comment) => ({
      id: comment.id,
      taskId: comment.taskId,
      content: comment.content,
      author: comment.user.fullName || comment.user.email,
      avatar: comment.user.avatarUrl,
      userId: comment.userId,
      timestamp: comment.createdAt,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));

    ApiResponse.success(transformedComments, 'Comments retrieved successfully').send(res);
  });

  /**
   * @route   POST /api/v1/tasks/:taskId/comments
   * @desc    Add a comment to a task
   * @access  Private
   */
  static addComment = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Transform response
    const transformedComment = {
      id: comment.id,
      taskId: comment.taskId,
      content: comment.content,
      author: comment.user.fullName || comment.user.email,
      avatar: comment.user.avatarUrl,
      userId: comment.userId,
      timestamp: comment.createdAt,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };

    ApiResponse.success(transformedComment, 'Comment added successfully').send(res, 201);
  });

  /**
   * @route   DELETE /api/v1/comments/:commentId
   * @desc    Delete a comment
   * @access  Private (comment author or project OWNER/ADMIN)
   */
  static deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Get comment with task and project info
    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
      include: {
        task: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    // Check if user is comment author
    const isAuthor = comment.userId === userId;

    // Check if user is project owner/admin
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: comment.task.projectId,
          userId,
        },
      },
      select: {
        role: true,
      },
    });

    const isProjectAdmin = projectMember && (projectMember.role === 'OWNER' || projectMember.role === 'ADMIN');

    if (!isAuthor && !isProjectAdmin) {
      throw ApiError.forbidden('You can only delete your own comments or you must be a project admin');
    }

    await prisma.taskComment.delete({
      where: { id: commentId },
    });

    ApiResponse.success(null, 'Comment deleted successfully').send(res);
  });
}

module.exports = TaskCommentController;
