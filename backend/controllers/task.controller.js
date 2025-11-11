const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { buildTaskHierarchy, transformTask } = require('../utils/taskHelpers');

/**
 * Task Controller
 * Handles task CRUD operations
 */

class TaskController {
  /**
   * @route   POST /api/v1/projects/:projectId/tasks
   * @desc    Create a new task
   * @access  Private (requires ProjectMember)
   */
  static createTask = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const {
      title,
      description,
      sectionId,
      type,
      assigneeId,
      startDate,
      dueDate,
      priority,
      status,
      approvalStatus,
      tags,
      customFields,
      parentId,
    } = req.body;
    const userId = req.user.id;

    // If parentId provided, calculate level
    let level = 0;
    let orderIndex = 0;

    if (parentId) {
      const parent = await prisma.task.findUnique({
        where: { id: parentId },
        select: { level: true, sectionId: true },
      });

      if (!parent) {
        throw ApiError.notFound('Parent task not found');
      }

      level = parent.level + 1;

      // For subtasks, add to the end of parent's subtasks
      const lastSubtask = await prisma.task.findFirst({
        where: { parentId },
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true },
      });
      orderIndex = lastSubtask ? lastSubtask.orderIndex + 1 : 0;
    } else if (sectionId) {
      // For top-level tasks, add to the top of the section (new tasks appear first)
      const firstTask = await prisma.task.findFirst({
        where: { projectId, sectionId, parentId: null },
        orderBy: { orderIndex: 'asc' },
        select: { orderIndex: true },
      });

      // New tasks get orderIndex = minOrderIndex - 1, ensuring they appear at the top
      orderIndex = firstTask ? firstTask.orderIndex - 1 : 0;
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        projectId,
        sectionId: sectionId || null,
        title,
        description: description || null,
        type: type || 'TASK',
        assigneeId: assigneeId || null,
        startDate: startDate || null,
        dueDate: dueDate || null,
        priority: priority || null,
        status: status || null,
        approvalStatus: approvalStatus || null,
        tags: tags || [],
        customFields: customFields || null,
        orderIndex,
        parentId: parentId || null,
        level,
        createdBy: userId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Transform response to match UI expectations
    const transformedTask = {
      ...task,
      name: task.title,
      assigneeName: task.assignee?.fullName || null,
      assigneeAvatar: task.assignee?.avatarUrl || null,
      subtaskCount: 0,
      isExpanded: false,
    };

    ApiResponse.success(transformedTask, 'Task created successfully').send(res, 201);
  });

  /**
   * @route   GET /api/v1/projects/:projectId/tasks
   * @desc    List tasks in a project
   * @access  Private (requires ProjectMember)
   * @query   nested - If true, returns hierarchical structure with subtasks nested
   */
  static listTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { sectionId, assigneeId, priority, status, completed, search, parentId, nested, page = 1, limit = 1000 } =
      req.query;

    // Build where clause
    const where = {
      projectId,
    };

    if (sectionId) where.sectionId = sectionId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (completed !== undefined) where.completed = completed;

    // When nested is requested, ignore parentId filter - we'll build hierarchy from all tasks
    if (nested !== 'true' && parentId !== undefined) {
      where.parentId = parentId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // If nested structure is requested, fetch ALL tasks for the section/project (no pagination on flat list)
    // Then build hierarchy and paginate the top-level tasks
    if (nested === 'true') {
      // Fetch all tasks in this project/section (including all subtasks at all levels)
      const allTasks = await prisma.task.findMany({
        where,
        orderBy: { orderIndex: 'asc' },
        include: {
          assignee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              subtasks: true,
            },
          },
        },
      });

      // Build hierarchical structure
      const hierarchicalTasks = buildTaskHierarchy(allTasks, null);

      // Transform tasks to match UI expectations
      const transformedTasks = hierarchicalTasks.map(transformTask);

      // Count only top-level tasks for pagination
      const topLevelTotal = transformedTasks.length;

      // Paginate at the top level
      const paginatedTasks = transformedTasks.slice(skip, skip + limitNum);

      ApiResponse.success(
        {
          data: paginatedTasks,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: topLevelTotal,
            totalPages: Math.ceil(topLevelTotal / limitNum),
          },
        },
        'Tasks retrieved successfully'
      ).send(res);
    } else {
      // Original flat structure (backward compatible)
      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          orderBy: { orderIndex: 'asc' },
          skip,
          take: limitNum,
          include: {
            assignee: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                subtasks: true,
              },
            },
          },
        }),
        prisma.task.count({ where }),
      ]);

      // Transform tasks to match UI expectations
      const transformedTasks = tasks.map((task) => ({
        ...task,
        name: task.title,
        assigneeName: task.assignee?.fullName || null,
        assigneeAvatar: task.assignee?.avatarUrl || null,
        subtaskCount: task._count.subtasks,
        isExpanded: false,
      }));

      ApiResponse.success(
        {
          data: transformedTasks,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
        'Tasks retrieved successfully'
      ).send(res);
    }
  });

  /**
   * @route   PATCH /api/v1/tasks/:taskId
   * @desc    Update a task
   * @access  Private (requires ProjectMember)
   */
  static updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const updateData = { ...req.body };

    // Map 'name' to 'title' for frontend compatibility
    if (updateData.name && !updateData.title) {
      updateData.title = updateData.name;
      delete updateData.name;
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, completed: true },
    });

    if (!existingTask) {
      throw ApiError.notFound('Task not found');
    }

    // If marking as completed, set completedAt
    if (updateData.completed === true && !existingTask.completed) {
      updateData.completedAt = new Date();
    } else if (updateData.completed === false) {
      updateData.completedAt = null;
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            subtasks: true,
          },
        },
      },
    });

    // Transform response
    const transformedTask = {
      ...updatedTask,
      name: updatedTask.title,
      assigneeName: updatedTask.assignee?.fullName || null,
      assigneeAvatar: updatedTask.assignee?.avatarUrl || null,
      subtaskCount: updatedTask._count.subtasks,
      isExpanded: false,
    };

    ApiResponse.success(transformedTask, 'Task updated successfully').send(res);
  });

  /**
   * @route   DELETE /api/v1/tasks/:taskId
   * @desc    Delete a task
   * @access  Private (requires ProjectMember)
   */
  static deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        parentId: true,
      },
    });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Delete task (will cascade to subtasks due to relation)
    await prisma.task.delete({
      where: { id: taskId },
    });

    ApiResponse.success(null, 'Task deleted successfully').send(res);
  });

  /**
   * @route   POST /api/v1/tasks/:taskId/move
   * @desc    Move task to different section
   * @access  Private (requires ProjectMember)
   */
  static moveTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { toSectionId, orderIndex } = req.body;

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        sectionId: true,
        projectId: true,
        orderIndex: true,
      },
    });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Calculate new orderIndex if not provided
    let newOrderIndex = orderIndex;
    if (newOrderIndex === undefined || newOrderIndex === null) {
      const lastTask = await prisma.task.findFirst({
        where: {
          projectId: task.projectId,
          sectionId: toSectionId,
        },
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true },
      });
      newOrderIndex = lastTask ? lastTask.orderIndex + 1 : 0;
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        sectionId: toSectionId,
        orderIndex: newOrderIndex,
      },
      include: {
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            subtasks: true,
          },
        },
      },
    });

    // Transform response
    const transformedTask = {
      ...updatedTask,
      name: updatedTask.title,
      assigneeName: updatedTask.assignee?.fullName || null,
      assigneeAvatar: updatedTask.assignee?.avatarUrl || null,
      subtaskCount: updatedTask._count.subtasks,
      isExpanded: false,
    };

    ApiResponse.success(transformedTask, 'Task moved successfully').send(res);
  });

  /**
   * @route   GET /api/v1/tasks/:taskId
   * @desc    Get single task with full details
   * @access  Private
   */
  static getTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        comments: {
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
          orderBy: { createdAt: 'desc' },
        },
        subtasks: {
          include: {
            assignee: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            subtasks: true,
          },
        },
      },
    });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Transform comments
    const transformedComments = task.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: comment.user.fullName || comment.user.email,
      avatar: comment.user.avatarUrl,
      userId: comment.userId,
      timestamp: comment.createdAt,
      createdAt: comment.createdAt,
    }));

    // Transform response
    const transformedTask = {
      ...task,
      name: task.title,
      assigneeName: task.assignee?.fullName || null,
      assigneeAvatar: task.assignee?.avatarUrl || null,
      subtaskCount: task._count.subtasks,
      isExpanded: false,
      comments: transformedComments,
    };

    ApiResponse.success(transformedTask, 'Task retrieved successfully').send(res);
  });

  /**
   * @route   POST /api/v1/tasks/:taskId/duplicate
   * @desc    Duplicate a task
   * @access  Private
   */
  static duplicateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Get original task
    const originalTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!originalTask) {
      throw ApiError.notFound('Task not found');
    }

    // Calculate new orderIndex (add after original)
    const orderIndex = originalTask.orderIndex + 0.5;

    // Create duplicate task
    const duplicateTask = await prisma.task.create({
      data: {
        projectId: originalTask.projectId,
        sectionId: originalTask.sectionId,
        title: `${originalTask.title} (Copy)`,
        description: originalTask.description,
        type: originalTask.type,
        assigneeId: originalTask.assigneeId,
        startDate: originalTask.startDate,
        dueDate: originalTask.dueDate,
        priority: originalTask.priority,
        status: originalTask.status,
        tags: originalTask.tags,
        customFields: originalTask.customFields,
        orderIndex,
        createdBy: userId,
      },
      include: {
        assignee: {
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
    const transformedTask = {
      ...duplicateTask,
      name: duplicateTask.title,
      assigneeName: duplicateTask.assignee?.fullName || null,
      assigneeAvatar: duplicateTask.assignee?.avatarUrl || null,
      subtaskCount: 0,
      isExpanded: false,
    };

    ApiResponse.success(transformedTask, 'Task duplicated successfully').send(res, 201);
  });

  /**
   * @route   POST /api/v1/tasks/:taskId/subtasks
   * @desc    Create a subtask
   * @access  Private
   */
  static createSubtask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    // Get parent task
    const parentTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        projectId: true,
        sectionId: true,
        level: true,
        _count: {
          select: {
            subtasks: true,
          },
        },
      },
    });

    if (!parentTask) {
      throw ApiError.notFound('Parent task not found');
    }

    // Calculate orderIndex for subtask (add at end)
    const lastSubtask = await prisma.task.findFirst({
      where: {
        parentId: taskId,
      },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    const orderIndex = lastSubtask ? lastSubtask.orderIndex + 1 : 0;

    // Create subtask
    const subtask = await prisma.task.create({
      data: {
        projectId: parentTask.projectId,
        sectionId: parentTask.sectionId,
        title: title || '',
        parentId: taskId,
        level: parentTask.level + 1,
        orderIndex,
        createdBy: userId,
      },
      include: {
        assignee: {
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
    const transformedTask = {
      ...subtask,
      name: subtask.title,
      assigneeName: null,
      assigneeAvatar: null,
      subtaskCount: 0,
      isExpanded: false,
    };

    ApiResponse.success(transformedTask, 'Subtask created successfully').send(res, 201);
  });

  /**
   * @route   GET /api/v1/projects/:projectId/tasks/options
   * @desc    Get task status and priority options
   * @access  Private (requires ProjectMember)
   */
  static getTaskOptions = asyncHandler(async (req, res) => {
    // Fetch status and priority options from separate tables
    const [statusOptions, priorityOptions] = await Promise.all([
      prisma.task_status_options.findMany({
        where: {
          isActive: true,
        },
        orderBy: { position: 'asc' },
        select: {
          id: true,
          label: true,
          value: true,
          color: true,
          icon: true,
          position: true,
        },
      }),
      prisma.task_priority_options.findMany({
        where: {
          isActive: true,
        },
        orderBy: { position: 'asc' },
        select: {
          id: true,
          label: true,
          value: true,
          color: true,
          icon: true,
          position: true,
        },
      }),
    ]);

    ApiResponse.success(
      {
        statusOptions,
        priorityOptions,
      },
      'Task options retrieved successfully'
    ).send(res);
  });
}

module.exports = TaskController;
