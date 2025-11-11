const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const onboardingRoutes = require('./onboarding.routes');
const tenantRoutes = require('./tenant.routes');
const invitationRoutes = require('./invitation.routes');
const projectRoutes = require('./project.routes');
const projectRolesRoutes = require('./projectRoles.routes');
const sectionByIdRoutes = require('./sectionById.routes');
const taskByIdRoutes = require('./taskById.routes');
const commentByIdRoutes = require('./commentById.routes');
const templateRoutes = require('./template.routes');
const teamRoutes = require('./team.routes');
const superAdminRoutes = require('./superAdmin.routes');

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/tenants', tenantRoutes);
router.use('/invitations', invitationRoutes);
router.use('/projects', projectRoutes);
router.use('/project-roles', projectRolesRoutes);
router.use('/sections', sectionByIdRoutes);
router.use('/tasks', taskByIdRoutes);
router.use('/comments', commentByIdRoutes);
router.use('/templates', templateRoutes);
router.use('/teams', teamRoutes);
router.use('/admin', superAdminRoutes); // Super admin routes

module.exports = router;
