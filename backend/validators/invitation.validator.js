const Joi = require('joi');

/**
 * Invitation Validators
 * Joi schemas for invitation endpoints
 */

const invitationValidators = {
  // POST /send-tenant
  sendTenantInvitations: {
    body: Joi.object({
      tenantId: Joi.string().uuid().required().messages({
        'string.guid': 'Invalid tenant ID format',
        'any.required': 'Tenant ID is required',
      }),
      emails: Joi.array().items(
        Joi.string().email().messages({
          'string.email': 'Each email must be a valid email address',
        })
      ).min(1).required().messages({
        'array.min': 'At least one email is required',
        'any.required': 'Emails are required',
      }),
      role: Joi.string().valid('ADMIN', 'MEMBER').default('MEMBER').messages({
        'any.only': 'Role must be either ADMIN or MEMBER',
      }),
    }),
  },

  // POST /send-project
  sendProjectInvitations: {
    body: Joi.object({
      projectId: Joi.string().uuid().required().messages({
        'string.guid': 'Invalid project ID format',
        'any.required': 'Project ID is required',
      }),
      emails: Joi.array().items(
        Joi.string().email().messages({
          'string.email': 'Each email must be a valid email address',
        })
      ).min(1).required().messages({
        'array.min': 'At least one email is required',
        'any.required': 'Emails are required',
      }),
    }),
  },
};

module.exports = invitationValidators;
