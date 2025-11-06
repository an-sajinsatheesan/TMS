const express = require('express');
const router = express.Router();
const OnboardingController = require('../controllers/onboarding.controller');
const OnboardingOptionsController = require('../controllers/onboardingOptions.controller');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const onboardingValidators = require('../validators/onboarding.validator');

/**
 * Onboarding Routes
 * Base path: /api/v1/onboarding
 */

// Public routes for options (no authentication required)
router.get('/options/all', OnboardingOptionsController.getAllOptions);
router.get('/options/app-usage', OnboardingOptionsController.getAppUsageOptions);
router.get('/options/industries', OnboardingOptionsController.getIndustryOptions);
router.get('/options/team-sizes', OnboardingOptionsController.getTeamSizeOptions);
router.get('/options/roles', OnboardingOptionsController.getRoleOptions);

// Apply authentication to all remaining routes
router.use(authenticate);

// GET /progress - Get current step and saved data
router.get('/progress', OnboardingController.getProgress);

// POST /profile - Save profile information (Step 3)
router.post('/profile', validate(onboardingValidators.profile), OnboardingController.saveProfile);

// POST /app-usage - Save app usage selection (Step 4)
router.post('/app-usage', OnboardingController.saveAppUsage);

// POST /industry - Save industry selection (Step 5)
router.post('/industry', OnboardingController.saveIndustry);

// POST /team-size - Save team size selection (Step 6)
router.post('/team-size', OnboardingController.saveTeamSize);

// POST /role-info - Save role and function information (Step 7 - legacy)
router.post('/role-info', validate(onboardingValidators.roleInfo), OnboardingController.saveRoleInfo);

// POST /project-setup - Save project setup (Steps 8-10)
router.post('/project-setup', validate(onboardingValidators.projectSetup), OnboardingController.saveProjectSetup);

// POST /layout - Save layout preference (Step 8)
router.post('/layout', validate(onboardingValidators.layout), OnboardingController.saveLayout);

// POST /complete - Complete onboarding (Step 9)
router.post('/complete', validate(onboardingValidators.complete), OnboardingController.completeOnboarding);

module.exports = router;
