const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const EmailService = require('../services/email.service');
const { cloneTemplateToProject } = require('./template.controller');

/**
 * Project Controller
 * Handles project CRUD operations
 * Updated to use unified Membership schema instead of TenantUser/ProjectMember
 */

class ProjectController {
  /**
   * @route   POST /api/v1/projects
   * @desc    Create a new project (blank or from template)
   * @access  Private
   */
  static createProject = asyncHandler(async (req, res) => {
    const { name, color, layout, templateId, sections, tasks, inviteEmails } = req.body;
    const userId = req.user.id;

    // Get user's tenant-level membership
    const tenantMembership = await prisma.tenant_users.findFirst({
      where: {
        userId,
      },
      select: {
        tenantId: true,
        tenants: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!tenantMembership) {
      throw ApiError.forbidden('You must belong to a workspace to create a project');
    }

    const tenantId = tenantMembership.tenantId;

    // Create project with sections and tasks in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let project;
      let createdSections = [];
      let createdTasks = [];

      // If templateId is provided, clone from template
      if (templateId) {
        const projectData = {
          tenantId,
          name,
          color: color || '#3b82f6',
          layout: layout || 'BOARD',
          createdBy: userId,
        };

        // Use cloneTemplateToProject to create project from template
        const clonedProject = await cloneTemplateToProject(templateId, projectData, tx);
        project = clonedProject;

        // Get created sections and tasks for response
        createdSections = await tx.projectSection.findMany({
          where: { projectId: project.id },
          orderBy: { position: 'asc' },
        });

        createdTasks = await tx.task.findMany({
          where: { projectId: project.id },
          orderBy: { orderIndex: 'asc' },
        });
      } else {
        // Create blank project
        // 1. Create project
        project = await tx.project.create({
          data: {
            tenantId,
            name,
            color: color || '#3b82f6',
            layout: layout || 'BOARD',
            createdBy: userId,
          },
        });

        // 2. Fetch status and priority options from separate tables
        const [statusOptions, priorityOptions] = await Promise.all([
          tx.task_status_options.findMany({
            where: {
              isActive: true,
            },
            orderBy: { position: 'asc' },
            select: { label: true, value: true, color: true, icon: true },
          }),
          tx.task_priority_options.findMany({
            where: {
              isActive: true,
            },
            orderBy: { position: 'asc' },
            select: { label: true, value: true, color: true, icon: true },
          }),
        ]);

        // 3. Create default columns with dynamic options
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

        // 4. Create sections if provided
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

        // 5. Create tasks if provided
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
      }

      // Add creator as OWNER member
      await tx.project_members.create({
        data: {
          id: uuidv4(),
          userId,
          projectId: project.id,
          role: 'OWNER',
        },
      });

      // Send project invitations if provided
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
              `${tenantMembership.tenants.name} - ${project.name}`,
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

    // Get user's tenant membership to include all tenant projects
    const tenantMembership = await prisma.tenant_users.findFirst({
      where: {
        userId,
      },
      select: {
        tenantId: true,
      },
    });

    // Build where clause:
    // - Include projects where user has PROJECT-level membership
    // - OR include all projects in user's tenant (if they have TENANT-level membership)
    const whereClause = {
      deletedAt: null,
      OR: [
        {
          // Projects where user has direct project membership
          project_members: {
            some: {
              userId,
            },
          },
        },
      ],
    };

    // If user has tenant membership, include all projects in their tenant
    if (tenantMembership) {
      whereClause.OR.push({
        tenantId: tenantMembership.tenantId,
      });
    }

    // Get projects (exclude templates which are in Template table now)
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          layout: true,
          createdAt: true,
          updatedAt: true,
          templateId: true, // Reference to source template if cloned
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
              project_members: true,
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
        where: whereClause,
      }),
    ]);

    // Transform response to match UI expectations
    const transformedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      layout: project.layout,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      templateId: project.templateId,
      memberCount: project._count.project_members,
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
   * @access  Private (requires Membership)
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
          status: true,
          dueDate: true,
          description: true,
          deletedAt: true,
          templateId: true, // Reference to source template
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
      // Get project members (PROJECT-level memberships)
      prisma.project_members.findMany({
        where: {
          projectId,
        },
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
   * @access  Private (requires PROJECT_ADMIN or TENANT_ADMIN)
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
        status: true,
        dueDate: true,
        description: true,
        deletedAt: true,
        templateId: true,
      },
    });

    ApiResponse.success(updatedProject, 'Project updated successfully').send(res);
  });

  /**
   * @route   DELETE /api/v1/projects/:projectId
   * @desc    Delete project
   * @access  Private (requires PROJECT_ADMIN)
   */
  static deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Delete project (cascades to sections, tasks, memberships, invitations)
    await prisma.project.delete({
      where: { id: projectId },
    });

    ApiResponse.success(null, 'Project deleted successfully').send(res);
  });

  /**
   * @route   PATCH /api/v1/projects/:projectId/status
   * @desc    Update project status
   * @access  Private (requires PROJECT_ADMIN or TENANT_ADMIN)
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
   * @access  Private (requires PROJECT_ADMIN or TENANT_ADMIN)
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
   * @access  Private (requires PROJECT_ADMIN)
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
   * @access  Private (requires PROJECT_ADMIN)
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
   * @access  Private (requires PROJECT_ADMIN)
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
        project_members: {
          some: {
            userId,
            role: 'PROJECT_ADMIN', // Only PROJECT_ADMIN can see trashed projects
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
            project_members: true,
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
        memberCount: project._count.project_members,
        taskCount: project._count.tasks,
        autoDeleteDate,
        daysUntilPermanentDeletion: Math.max(0, daysLeft),
      };
    });

    ApiResponse.success(projectsWithDaysLeft, 'Trashed projects retrieved successfully').send(res);
  });

  /**
   * @route   GET /api/v1/projects/:projectId/activities
   * @desc    Get project activity feed
   * @access  Private (requires Membership)
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
   * @access  Private (requires Membership)
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
   * @desc    List templates (now proxies to template controller)
   * @access  Private
   * @note    Templates are now stored in separate Template table
   */
  static listTemplates = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const userId = req.user.id;

    // Get user's tenant membership for filtering
    const tenantMembership = await prisma.tenant_users.findFirst({
      where: {
        userId,
      },
      select: { tenantId: true },
    });

    if (!tenantMembership) {
      throw ApiError.forbidden('You must belong to a workspace to view templates');
    }

    // Build where clause to include global templates
    const where = {
      isGlobal: true,
    };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    const templates = await prisma.template.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        layout: true,
        category: true,
        isGlobal: true,
        icon: true,
        thumbnail: true,
        _count: {
          select: {
            sections: true,
            clonedProjects: true,
          },
        },
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group templates by category
    const groupedTemplates = templates.reduce((acc, template) => {
      const cat = template.category;
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(template);
      return acc;
    }, {});

    ApiResponse.success(
      {
        all: templates,
        byCategory: groupedTemplates,
        global: templates, // All are global in new system
        tenant: [], // Tenant-specific templates not supported yet
      },
      'Templates retrieved successfully'
    ).send(res);
  });

  /**
   * @route   POST /api/v1/projects/templates/:templateId/clone
   * @desc    Clone template to create new project
   * @access  Private
   * @note    This route is kept for backward compatibility
   *          New projects should use POST /api/v1/projects with templateId in body
   */
  static cloneTemplate = asyncHandler(async (req, res) => {
    const { templateId } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
      throw ApiError.badRequest('Project name is required');
    }

    // Get user's tenant-level membership
    const tenantMembership = await prisma.tenant_users.findFirst({
      where: {
        userId,
      },
      select: { tenantId: true },
    });

    if (!tenantMembership) {
      throw ApiError.forbidden('You must belong to a workspace to create a project');
    }

    // Clone template in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create project data
      const projectData = {
        tenantId: tenantMembership.tenantId,
        name,
        createdBy: userId,
      };

      // Use cloneTemplateToProject
      const project = await cloneTemplateToProject(templateId, projectData, tx);

      // Add creator as project owner
      await tx.project_members.create({
        data: {
          id: uuidv4(),
          projectId: project.id,
          userId,
          role: 'OWNER',
        },
      });

      // Create activity log
      await tx.projectActivity.create({
        data: {
          projectId: project.id,
          userId,
          type: 'PROJECT_CREATED',
          description: `created project from template`,
          metadata: {
            templateId: templateId,
          },
        },
      });

      return project;
    });

    ApiResponse.success(result, 'Project created from template successfully').send(res, 201);
  });
}

module.exports = ProjectController;
