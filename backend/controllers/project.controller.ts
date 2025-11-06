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
    const { name, layout, sections, tasks, inviteEmails } = req.body;
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

      // 3. Create default columns
      const defaultColumns = [
        {
          name: 'Assignee',
          type: 'user',
          width: 200,
          visible: true,
          position: 0,
        },
        {
          name: 'Due Date',
          type: 'date',
          width: 150,
          visible: true,
          position: 1,
        },
        {
          name: 'Priority',
          type: 'select',
          width: 120,
          visible: true,
          position: 2,
          options: [
            { label: 'High', value: 'High', color: '#ef4444' },
            { label: 'Medium', value: 'Medium', color: '#f59e0b' },
            { label: 'Low', value: 'Low', color: '#3b82f6' },
          ],
        },
        {
          name: 'Status',
          type: 'select',
          width: 150,
          visible: true,
          position: 3,
          options: [
            { label: 'On Track', value: 'On Track', color: '#10b981' },
            { label: 'At Risk', value: 'At Risk', color: '#f59e0b' },
            { label: 'Off Track', value: 'Off Track', color: '#ef4444' },
          ],
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

      // 5. Create tasks if provided
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

      // 6. Send project invitations if provided
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

    // Get projects where user is a member
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: {
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
}

module.exports = ProjectController;
