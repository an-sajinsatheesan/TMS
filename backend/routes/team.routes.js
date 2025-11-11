const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/team.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Team CRUD routes
router.get('/', TeamController.listTeams);
router.post('/', TeamController.createTeam);
router.get('/:teamId', TeamController.getTeam);
router.patch('/:teamId', TeamController.updateTeam);
router.delete('/:teamId', TeamController.deleteTeam);

// Team member routes
router.get('/:teamId/members', TeamController.getTeamMembers);
router.post('/:teamId/members', TeamController.addTeamMember);
router.patch('/:teamId/members/:memberId', TeamController.updateTeamMemberRole);
router.delete('/:teamId/members/:memberId', TeamController.removeTeamMember);

module.exports = router;
