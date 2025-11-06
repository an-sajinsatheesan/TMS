const express = require('express');
const router = express.Router();
const InvitationController = require('../controllers/invitation.controller');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const invitationValidators = require('../validators/invitation.validator');

/**
 * Invitation Routes
 * Base path: /api/v1/invitations
 */

// GET /pending - Get pending invitations for current user (protected) - must be before /:token
router.get('/pending', authenticate, InvitationController.getPendingInvitations);

// POST /send-tenant - Send tenant invitations (protected)
router.post('/send-tenant', authenticate, validate(invitationValidators.sendTenantInvitations), InvitationController.sendTenantInvitations);

// POST /send-project - Send project invitations (protected)
router.post('/send-project', authenticate, validate(invitationValidators.sendProjectInvitations), InvitationController.sendProjectInvitations);

// GET /:token - Get invitation details (public)
router.get('/:token', InvitationController.getInvitationDetails);

// POST /accept/:token - Accept invitation (public/authenticated)
router.post('/accept/:token', InvitationController.acceptInvitation);

module.exports = router;
