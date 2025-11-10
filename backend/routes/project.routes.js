const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/project.controller');
const ProjectMemberController = require('../controllers/projectMember.controller');
const { authenticate } = require('../middlewares/auth');
const {
  projectContext,
  requireProjectAdmin,
  requireProjectOwner,
} = require('../middlewares/membership');
const {
  validate,
  validateQuery,
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
  inviteMembersSchema,
  updateMemberRoleSchema,
} = require('../validators/project.validator');

// Import nested routes
const sectionRoutes = require('./section.routes');
const taskRoutes = require('./task.routes');
const columnRoutes = require('./projectColumn.routes');

/**
 * Project Routes
 * Base path: /api/v1/projects
 */

// Mount nested routes
router.use('/:projectId/sections', sectionRoutes);
router.use('/:projectId/tasks', taskRoutes);
router.use('/:projectId/columns', columnRoutes);

// ============================================
// Project CRUD Routes
// ============================================

/**
 * @route   POST /api/v1/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validate(createProjectSchema),
  ProjectController.createProject
);

/**
 * @route   GET /api/v1/projects
 * @desc    List all projects user has access to
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validateQuery(listProjectsSchema),
  ProjectController.listProjects
);

/**
 * @route   GET /api/v1/projects/:projectId
 * @desc    Get full project data (project, sections, tasks, members)
 * @access  Private (requires ProjectMember)
 */
router.get(
  '/:projectId',
  authenticate,
  projectContext,
  ProjectController.getProject
);

/**
 * @route   PATCH /api/v1/projects/:projectId
 * @desc    Update project
 * @access  Private (requires OWNER or ADMIN)
 */
router.patch(
  '/:projectId',
  authenticate,
  projectContext,
  requireProjectAdmin,
  validate(updateProjectSchema),
  ProjectController.updateProject
);

/**
 * @route   DELETE /api/v1/projects/:projectId
 * @desc    Delete project
 * @access  Private (requires OWNER)
 */
router.delete(
  '/:projectId',
  authenticate,
  projectContext,
  requireProjectOwner,
  ProjectController.deleteProject
);

// ============================================
// Project Status and Management Routes
// ============================================

/**
 * @route   PATCH /api/v1/projects/:projectId/status
 * @desc    Update project status
 * @access  Private (requires OWNER or ADMIN)
 */
router.patch(
  '/:projectId/status',
  authenticate,
  projectContext,
  requireProjectAdmin,
  ProjectController.updateProjectStatus
);

/**
 * @route   PATCH /api/v1/projects/:projectId/due-date
 * @desc    Update project due date
 * @access  Private (requires OWNER or ADMIN)
 */
router.patch(
  '/:projectId/due-date',
  authenticate,
  projectContext,
  requireProjectAdmin,
  ProjectController.updateProjectDueDate
);

/**
 * @route   POST /api/v1/projects/:projectId/trash
 * @desc    Move project to trash (soft delete)
 * @access  Private (requires OWNER)
 */
router.post(
  '/:projectId/trash',
  authenticate,
  projectContext,
  requireProjectOwner,
  ProjectController.moveToTrash
);

/**
 * @route   POST /api/v1/projects/:projectId/restore
 * @desc    Restore project from trash
 * @access  Private (requires OWNER)
 */
router.post(
  '/:projectId/restore',
  authenticate,
  projectContext,
  requireProjectOwner,
  ProjectController.restoreFromTrash
);

/**
 * @route   DELETE /api/v1/projects/:projectId/permanent
 * @desc    Permanently delete a trashed project
 * @access  Private (requires OWNER)
 */
router.delete(
  '/:projectId/permanent',
  authenticate,
  projectContext,
  requireProjectOwner,
  ProjectController.permanentDelete
);

// ============================================
// Project Activity and Analytics Routes
// ============================================

/**
 * @route   GET /api/v1/projects/:projectId/activities
 * @desc    Get project activity feed
 * @access  Private (requires ProjectMember)
 */
router.get(
  '/:projectId/activities',
  authenticate,
  projectContext,
  ProjectController.getActivities
);

/**
 * @route   GET /api/v1/projects/:projectId/dashboard
 * @desc    Get project dashboard statistics
 * @access  Private (requires ProjectMember)
 */
router.get(
  '/:projectId/dashboard',
  authenticate,
  projectContext,
  ProjectController.getDashboardStats
);

// ============================================
// Trash and Template Routes (Global)
// ============================================

/**
 * @route   GET /api/v1/projects/trash/list
 * @desc    List trashed projects
 * @access  Private
 */
router.get('/trash/list', authenticate, ProjectController.listTrashedProjects);

/**
 * @route   GET /api/v1/projects/templates/list
 * @desc    List all project templates
 * @access  Private
 */
router.get('/templates/list', authenticate, ProjectController.listTemplates);

/**
 * @route   POST /api/v1/projects/templates/:templateId/clone
 * @desc    Clone template to create new project
 * @access  Private
 */
router.post(
  '/templates/:templateId/clone',
  authenticate,
  ProjectController.cloneTemplate
);

// ============================================
// Project Member Routes
// ============================================

/**
 * @route   GET /api/v1/projects/:projectId/members
 * @desc    List project members
 * @access  Private (requires ProjectMember)
 */
router.get(
  '/:projectId/members',
  authenticate,
  projectContext,
  ProjectMemberController.listMembers
);

/**
 * @route   POST /api/v1/projects/:projectId/members/invite
 * @desc    Invite members to project
 * @access  Private (requires OWNER or ADMIN)
 */
router.post(
  '/:projectId/members/invite',
  authenticate,
  projectContext,
  requireProjectAdmin,
  validate(inviteMembersSchema),
  ProjectMemberController.inviteMembers
);

/**
 * @route   PATCH /api/v1/projects/:projectId/members/:memberId
 * @desc    Update member role
 * @access  Private (requires OWNER)
 */
router.patch(
  '/:projectId/members/:memberId',
  authenticate,
  projectContext,
  requireProjectOwner,
  validate(updateMemberRoleSchema),
  ProjectMemberController.updateMemberRole
);

/**
 * @route   DELETE /api/v1/projects/:projectId/members/:memberId
 * @desc    Remove member from project
 * @access  Private (requires OWNER or ADMIN)
 */
router.delete(
  '/:projectId/members/:memberId',
  authenticate,
  projectContext,
  requireProjectAdmin,
  ProjectMemberController.removeMember
);

module.exports = router;
