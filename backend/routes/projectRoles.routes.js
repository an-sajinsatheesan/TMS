const express = require('express');
const ProjectRolesController = require('../controllers/projectRoles.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

/**
 * Project Roles Routes
 * All routes require authentication
 */

router.use(authenticate);

// Get all roles
router.get('/', ProjectRolesController.getRoles);

// Get default role
router.get('/default', ProjectRolesController.getDefaultRole);

// Get specific role
router.get('/:roleValue', ProjectRolesController.getRole);

module.exports = router;
