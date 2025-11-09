const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const EmailService = require('../services/email.service');

/**
 * Project Controller
 * Handles project CRUD operations
 */

class ProjectController {
  /**
   * @route   POST /api/v1/projects
   * @desc    Create a new project
   * @access  Private
   */
  static createProject = asyncHandler(async (req, res) => {
    const { name, color, layout, sections, tasks, inviteEmails } = req.body;
    const userId = req.user.id;

    // Get user's tenant
    const tenantUser = await prisma.tenantUser.findFirst({
      where: { userId },
      select: {
        tenantId: true,
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!tenantUser) {
      throw ApiError.forbidden('You must belong to a workspace to create a project');
    }

    const tenantId = tenantUser.tenantId;

    // Create project with sections and tasks in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create project
      const project = await tx.project.create({
        data: {
          tenantId,
          name,
          color: color || '#3b82f6',
          layout: layout || 'BOARD',
          createdBy: userId,
        },
      });

      // 2. Add creator as PROJECT OWNER
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId,
          role: 'OWNER',
        },
      });

      // 3. Fetch status and priority options from database
      const [statusOptions, priorityOptions] = await Promise.all([
        tx.taskStatusOption.findMany({
          where: { isActive: true },
          orderBy: { position: 'asc' },
          select: { label: true, value: true, color: true, icon: true },
        }),
        tx.taskPriorityOption.findMany({
          where: { isActive: true },
          orderBy: { position: 'asc' },
          select: { label: true, value: true, color: true, icon: true },
        }),
      ]);

      // 4. Create default columns with dynamic options
      const defaultColumns = [
        {
          name: 'Assignee',
          type: 'user',
          width: 200,
          visible: true,
          isDefault: true,
          position: 0,
        },
        {
          name: 'Due Date',
          type: 'date',
          width: 150,
          visible: true,
          isDefault: true,
          position: 1,
        },
        {
          name: 'Priority',
          type: 'select',
          width: 120,
          visible: true,
          isDefault: true,
          position: 2,
          options: priorityOptions,
        },
        {
          name: 'Status',
          type: 'select',
          width: 150,
          visible: true,
          isDefault: true,
          position: 3,
          options: statusOptions,
        },
      ];

      for (const columnData of defaultColumns) {
        await tx.projectColumn.create({
          data: {
            projectId: project.id,
            ...columnData,
          },
        });
      }

      // 5. Create sections if provided
      const createdSections = [];
      if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          const createdSection = await tx.projectSection.create({
            data: {
              projectId: project.id,
              name: section.name,
              color: section.color || '#94a3b8',
              position: i,
            },
          });
          createdSections.push(createdSection);
        }
      }

      // 6. Create tasks if provided
      const createdTasks = [];
      if (tasks && tasks.length > 0) {
        for (const task of tasks) {
          // Find matching section
          const section = createdSections.find((s) => s.name === task.sectionName);

          const createdTask = await tx.task.create({
            data: {
              projectId: project.id,
              sectionId: section?.id || null,
              title: task.title,
              createdBy: userId,
              orderIndex: 0,
            },
          });
          createdTasks.push(createdTask);
        }
      }

      // 7. Send project invitations if provided
      const invitations = [];
      if (inviteEmails && inviteEmails.length > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        for (const email of inviteEmails) {
          const token = uuidv4();

          const invitation = await tx.invitation.create({
            data: {
              tenantId,
              projectId: project.id,
              email,
              invitedBy: userId,
              token,
              type: 'PROJECT',
              expiresAt,
            },
          });

          invitations.push(invitation);

          // Send invitation email
          try {
            await EmailService.sendInvitationEmail(
              email,
              `${tenantUser.tenant.name} - ${project.name}`,
              req.user.fullName || req.user.email,
              token
            );
          } catch (emailError) {
            console.error('Failed to send invitation email:', emailError);
            // Continue even if email fails
          }
        }
      }

      return {
        project,
        sections: createdSections,
        tasks: createdTasks,
        invitationsSent: invitations.length,
      };
    });

    ApiResponse.success(result, 'Project created successfully').send(res, 201);
  });

  /**
   * @route   GET /api/v1/projects
   * @desc    List all projects user has access to
   * @access  Private
   */
  static listProjects = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 100, sort = 'createdAt', order = 'desc' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get projects where user is a member (exclude deleted and templates)
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: {
          deletedAt: null,
          isTemplate: false,
          members: {
            some: {
              userId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          layout: true,
          createdAt: true,
          updatedAt: true,
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
        },
        orderBy: {
          [sort]: order,
        },
        skip,
        take: limitNum,
      }),
      prisma.project.count({
        where: {
          deletedAt: null,
          isTemplate: false,
          members: {
            some: {
              userId,
            },
          },
        },
      }),
    ]);

    // Transform response to match UI expectations
    const transformedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      layout: project.layout,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      memberCount: project._count.members,
      taskCount: project._count.tasks,
      creator: project.creator,
    }));

    ApiResponse.success(
      {
        data: transformedProjects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Projects retrieved successfully'
    ).send(res);
  });

  /**
   * @route   GET /api/v1/projects/:projectId
   * @desc    Get full project data (project, sections, tasks, members)
   * @access  Private (requires ProjectMember)
   */
  static getProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Get complete project data
    const [project, sections, tasks, members] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          name: true,
          layout: true,
          tenantId: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      // Get sections ordered by position
      prisma.projectSection.findMany({
        where: { projectId },
        orderBy: { position: 'asc' },
        select: {
          id: true,
          name: true,
          projectId: true,
          color: true,
          position: true,
          isCollapsed: true,
          kanbanWipLimit: true,
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      }),
      // Get tasks with assignee info
      prisma.task.findMany({
        where: { projectId },
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          projectId: true,
          sectionId: true,
          title: true,
          description: true,
          type: true,
          completed: true,
          assigneeId: true,
          startDate: true,
          dueDate: true,
          priority: true,
          status: true,
          approvalStatus: true,
          tags: true,
          customFields: true,
          orderIndex: true,
          completedAt: true,
          parentId: true,
          level: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
          assignee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      // Get project members
      prisma.projectMember.findMany({
        where: { projectId },
        select: {
          id: true,
          projectId: true,
          userId: true,
          role: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    // Transform sections to include taskCount
    const transformedSections = sections.map((section) => ({
      id: section.id,
      name: section.name,
      projectId: section.projectId,
      color: section.color,
      orderIndex: section.position, // UI uses orderIndex
      isCollapsed: section.isCollapsed,
      kanbanWipLimit: section.kanbanWipLimit,
      taskCount: section._count.tasks,
    }));

    // Transform tasks to include assignee name and avatar
    const transformedTasks = tasks.map((task) => ({
      ...task,
      name: task.title, // UI uses 'name' field
      assigneeName: task.assignee?.fullName || null,
      assigneeAvatar: task.assignee?.avatarUrl || null,
      subtaskCount: tasks.filter((t) => t.parentId === task.id).length,
      isExpanded: false,
    }));

    ApiResponse.success(
      {
        project,
        sections: transformedSections,
        tasks: transformedTasks,
        members,
      },
      'Project data retrieved successfully'
    ).send(res);
  });

  /**
   * @route   PATCH /api/v1/projects/:projectId
   * @desc    Update project
   * @access  Private (requires OWNER or ADMIN)
   */
  static updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { name, layout } = req.body;

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        ...(layout && { layout }),
      },
      select: {
        id: true,
        name: true,
        layout: true,
        tenantId: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    ApiResponse.success(updatedProject, 'Project updated successfully').send(res);
  });

  /**
   * @route   DELETE /api/v1/projects/:projectId
   * @desc    Delete project
   * @access  Private (requires OWNER)
   */
  static deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Delete project (cascades to sections, tasks, members, invitations)
    await prisma.project.delete({
      where: { id: projectId },
    });

    ApiResponse.success(null, 'Project deleted successfully').send(res);
  });

  /**
   * @route   PATCH /api/v1/projects/:projectId/status
   * @desc    Update project status
   * @access  Private (requires OWNER or ADMIN)
   */
  static updateProjectStatus = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { status } = req.body;

    if (!status || !['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'].includes(status)) {
      throw ApiError.badRequest('Invalid status. Must be one of: ACTIVE, PAUSED, COMPLETED, ARCHIVED');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get old status for activity log
      const oldProject = await tx.project.findUnique({
        where: { id: projectId },
        select: { status: true, name: true },
      });

      // Update project status
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: { status },
        select: {
          id: true,
          name: true,
          status: true,
          updatedAt: true,
        },
      });

      // Create activity log
      await tx.projectActivity.create({
        data: {
          projectId,
          userId: req.user.id,
          type: 'PROJECT_STATUS_CHANGED',
          description: `changed project status from ${oldProject.status} to ${status}`,
          metadata: {
            oldStatus: oldProject.status,
            newStatus: status,
          },
        },
      });

      return updatedProject;
    });

    ApiResponse.success(result, 'Project status updated successfully').send(res);
  });

  /**
   * @route   PATCH /api/v1/projects/:projectId/due-date
   * @desc    Update project due date
   * @access  Private (requires OWNER or ADMIN)
   */
  static updateProjectDueDate = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { dueDate } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Update project due date
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: {
          dueDate: dueDate ? new Date(dueDate) : null
        },
        select: {
          id: true,
          name: true,
          dueDate: true,
          updatedAt: true,
        },
      });

      // Create activity log
      await tx.projectActivity.create({
        data: {
          projectId,
          userId: req.user.id,
          type: 'PROJECT_UPDATED',
          description: dueDate ? `set project due date to ${new Date(dueDate).toLocaleDateString()}` : 'removed project due date',
          metadata: {
            field: 'dueDate',
            newValue: dueDate,
          },
        },
      });

      return updatedProject;
    });

    ApiResponse.success(result, 'Project due date updated successfully').send(res);
  });

  /**
   * @route   POST /api/v1/projects/:projectId/trash
   * @desc    Move project to trash (soft delete)
   * @access  Private (requires OWNER)
   */
  static moveToTrash = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const trashedProject = await tx.project.update({
        where: { id: projectId },
        data: { deletedAt: new Date() },
        select: {
          id: true,
          name: true,
          deletedAt: true,
        },
      });

      // Create activity log
      await tx.projectActivity.create({
        data: {
          projectId,
          userId: req.user.id,
          type: 'PROJECT_DELETED',
          description: 'moved project to trash',
        },
      });

      return trashedProject;
    });

    ApiResponse.success(result, 'Project moved to trash successfully').send(res);
  });

  /**
   * @route   POST /api/v1/projects/:projectId/restore
   * @desc    Restore project from trash
   * @access  Private (requires OWNER)
   */
  static restoreFromTrash = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const restoredProject = await tx.project.update({
        where: {
          id: projectId,
          deletedAt: { not: null },
        },
        data: { deletedAt: null },
        select: {
          id: true,
          name: true,
          deletedAt: true,
        },
      });

      // Create activity log
      await tx.projectActivity.create({
        data: {
          projectId,
          userId: req.user.id,
          type: 'PROJECT_RESTORED',
          description: 'restored project from trash',
        },
      });

      return restoredProject;
    });

    ApiResponse.success(result, 'Project restored successfully').send(res);
  });

  /**
   * @route   DELETE /api/v1/projects/:projectId/permanent
   * @desc    Permanently delete a trashed project
   * @access  Private (requires OWNER)
   */
  static permanentDelete = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Verify project is in trash before permanent deletion
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { deletedAt: true },
    });

    if (!project || !project.deletedAt) {
      throw ApiError.badRequest('Project must be in trash before permanent deletion');
    }

    // Permanently delete project (cascades to all related data)
    await prisma.project.delete({
      where: { id: projectId },
    });

    ApiResponse.success(null, 'Project permanently deleted').send(res);
  });

  /**
   * @route   GET /api/v1/projects/trash/list
   * @desc    List trashed projects
   * @access  Private
   */
  static listTrashedProjects = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const trashedProjects = await prisma.project.findMany({
      where: {
        deletedAt: { not: null },
        members: {
          some: {
            userId,
            role: 'OWNER', // Only owners can see trashed projects
          },
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
        deletedAt: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: {
        deletedAt: 'desc',
      },
    });

    // Calculate days until auto-deletion (30 days from deletedAt)
    const projectsWithDaysLeft = trashedProjects.map(project => {
      const deletedDate = new Date(project.deletedAt);
      const autoDeleteDate = new Date(deletedDate);
      autoDeleteDate.setDate(autoDeleteDate.getDate() + 30);
      const daysLeft = Math.ceil((autoDeleteDate - new Date()) / (1000 * 60 * 60 * 24));

      return {
        ...project,
        autoDeleteDate,
        daysUntilPermanentDeletion: Math.max(0, daysLeft),
      };
    });

    ApiResponse.success(projectsWithDaysLeft, 'Trashed projects retrieved successfully').send(res);
  });

  /**
   * @route   GET /api/v1/projects/:projectId/activities
   * @desc    Get project activity feed
   * @access  Private (requires ProjectMember)
   */
  static getActivities = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const activities = await prisma.projectActivity.findMany({
      where: { projectId },
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
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.projectActivity.count({
      where: { projectId },
    });

    ApiResponse.success(
      {
        data: activities,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      },
      'Activities retrieved successfully'
    ).send(res);
  });

  /**
   * @route   GET /api/v1/projects/:projectId/dashboard
   * @desc    Get project dashboard statistics
   * @access  Private (requires ProjectMember)
   */
  static getDashboardStats = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const [
      totalTasks,
      completedTasks,
      incompleteTasks,
      overdueTasks,
      tasksBySection,
      tasksByStatus,
      upcomingTasksByAssignee,
      taskCompletionOverTime,
    ] = await Promise.all([
      // Total tasks count
      prisma.task.count({
        where: { projectId, parentId: null },
      }),

      // Completed tasks count
      prisma.task.count({
        where: { projectId, completed: true, parentId: null },
      }),

      // Incomplete tasks count
      prisma.task.count({
        where: { projectId, completed: false, parentId: null },
      }),

      // Overdue tasks count
      prisma.task.count({
        where: {
          projectId,
          completed: false,
          dueDate: { lt: new Date() },
          parentId: null,
        },
      }),

      // Tasks by section (for bar chart)
      prisma.projectSection.findMany({
        where: { projectId },
        select: {
          id: true,
          name: true,
          color: true,
          _count: {
            select: {
              tasks: {
                where: {
                  completed: false,
                  parentId: null,
                },
              },
            },
          },
        },
      }),

      // Tasks by completion status (for pie chart)
      prisma.task.groupBy({
        by: ['completed'],
        where: { projectId, parentId: null },
        _count: true,
      }),

      // Upcoming tasks by assignee (for bar chart)
      prisma.task.groupBy({
        by: ['assigneeId'],
        where: {
          projectId,
          completed: false,
          dueDate: { gte: new Date() },
          parentId: null,
        },
        _count: true,
      }),

      // Task completion over last 7 days (for line chart)
      prisma.task.findMany({
        where: {
          projectId,
          completedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          parentId: null,
        },
        select: {
          completedAt: true,
        },
      }),
    ]);

    // Get assignee details for upcoming tasks
    const assigneeIds = upcomingTasksByAssignee
      .map(item => item.assigneeId)
      .filter(id => id !== null);

    const assignees = await prisma.user.findMany({
      where: { id: { in: assigneeIds } },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
      },
    });

    // Format data for charts
    const tasksBySectionData = tasksBySection.map(section => ({
      name: section.name,
      count: section._count.tasks,
      color: section.color,
    }));

    const tasksByStatusData = tasksByStatus.map(item => ({
      status: item.completed ? 'Completed' : 'Incomplete',
      count: item._count,
    }));

    const upcomingTasksByAssigneeData = upcomingTasksByAssignee.map(item => {
      const assignee = assignees.find(a => a.id === item.assigneeId);
      return {
        assignee: assignee ? assignee.fullName || assignee.email : 'Unassigned',
        count: item._count,
      };
    });

    // Group task completions by date
    const completionByDate = {};
    taskCompletionOverTime.forEach(task => {
      const date = new Date(task.completedAt).toISOString().split('T')[0];
      completionByDate[date] = (completionByDate[date] || 0) + 1;
    });

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push({
        date: dateStr,
        count: completionByDate[dateStr] || 0,
      });
    }

    ApiResponse.success(
      {
        summary: {
          totalTasks,
          completedTasks,
          incompleteTasks,
          overdueTasks,
        },
        charts: {
          tasksBySection: tasksBySectionData,
          tasksByStatus: tasksByStatusData,
          upcomingTasksByAssignee: upcomingTasksByAssigneeData,
          taskCompletionOverTime: last7Days,
        },
      },
      'Dashboard statistics retrieved successfully'
    ).send(res);
  });

  /**
   * @route   GET /api/v1/projects/templates/list
   * @desc    List all project templates
   * @access  Private
   */
  static listTemplates = asyncHandler(async (req, res) => {
    const { category } = req.query;

    const where = {
      isTemplate: true,
      deletedAt: null,
    };

    if (category && category !== 'ALL') {
      where.templateCategory = category;
    }

    const templates = await prisma.project.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        layout: true,
        templateCategory: true,
        _count: {
          select: {
            sections: true,
            tasks: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Group templates by category
    const groupedTemplates = templates.reduce((acc, template) => {
      const category = template.templateCategory;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {});

    ApiResponse.success(
      {
        all: templates,
        byCategory: groupedTemplates,
      },
      'Templates retrieved successfully'
    ).send(res);
  });

  /**
   * @route   POST /api/v1/projects/templates/:templateId/clone
   * @desc    Clone template to create new project
   * @access  Private
   */
  static cloneTemplate = asyncHandler(async (req, res) => {
    const { templateId } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
      throw ApiError.badRequest('Project name is required');
    }

    // Get user's tenant
    const tenantUser = await prisma.tenantUser.findFirst({
      where: { userId },
      select: { tenantId: true },
    });

    if (!tenantUser) {
      throw ApiError.forbidden('You must belong to a workspace to create a project');
    }

    // Get template with sections and tasks
    const template = await prisma.project.findUnique({
      where: {
        id: templateId,
        isTemplate: true,
      },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              where: { parentId: null },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        columns: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!template) {
      throw ApiError.notFound('Template not found');
    }

    // Clone template in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create new project from template
      const project = await tx.project.create({
        data: {
          tenantId: tenantUser.tenantId,
          name,
          description: template.description,
          color: template.color,
          layout: template.layout,
          createdBy: userId,
          isTemplate: false,
        },
      });

      // Add creator as project owner
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId,
          role: 'OWNER',
        },
      });

      // Clone columns
      for (const column of template.columns) {
        await tx.projectColumn.create({
          data: {
            projectId: project.id,
            name: column.name,
            type: column.type,
            width: column.width,
            visible: column.visible,
            isDefault: column.isDefault,
            position: column.position,
            options: column.options,
          },
        });
      }

      // Clone sections and tasks
      const sectionMapping = {};
      for (const section of template.sections) {
        const newSection = await tx.projectSection.create({
          data: {
            projectId: project.id,
            name: section.name,
            color: section.color,
            position: section.position,
          },
        });
        sectionMapping[section.id] = newSection.id;

        // Clone tasks for this section
        for (const task of section.tasks) {
          await tx.task.create({
            data: {
              projectId: project.id,
              sectionId: newSection.id,
              title: task.title,
              description: task.description,
              type: task.type,
              priority: task.priority,
              status: task.status,
              orderIndex: task.orderIndex,
              level: task.level,
              createdBy: userId,
            },
          });
        }
      }

      // Create activity log
      await tx.projectActivity.create({
        data: {
          projectId: project.id,
          userId,
          type: 'PROJECT_CREATED',
          description: `created project from template "${template.name}"`,
          metadata: {
            templateId: template.id,
            templateName: template.name,
          },
        },
      });

      return project;
    });

    ApiResponse.success(result, 'Project created from template successfully').send(res, 201);
  });
}

module.exports = ProjectController;
