const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/project.controller');
const ProjectMemberController = require('../controllers/projectMember.controller');
const { authenticate } = require('../middlewares/auth');
const {
  checkProjectAccess,
  checkProjectAdmin,
  checkProjectOwner,
} = require('../middlewares/projectAccess.middleware');
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
  checkProjectAccess,
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
  checkProjectAccess,
  checkProjectAdmin,
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
  checkProjectAccess,
  checkProjectOwner,
  ProjectController.deleteProject
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
  checkProjectAccess,
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
  checkProjectAccess,
  checkProjectAdmin,
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
  checkProjectAccess,
  checkProjectOwner,
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
  checkProjectAccess,
  checkProjectAdmin,
  ProjectMemberController.removeMember
);

module.exports = router;
