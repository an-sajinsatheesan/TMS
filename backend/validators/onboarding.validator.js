const Joi = require('joi');

/**
 * Onboarding Validators
 * Joi schemas for onboarding endpoints
 */

const onboardingValidators = {
  // POST /profile (Step 3)
  profile: {
    body: Joi.object({
      fullName: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Full name must be at least 2 characters',
        'string.max': 'Full name must not exceed 100 characters',
        'any.required': 'Full name is required',
      }),
      password: Joi.string().min(8).max(100).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).messages({
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must not exceed 100 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
      avatarUrl: Joi.string().uri().allow(null, '').messages({
        'string.uri': 'Avatar URL must be a valid URL',
      }),
    }),
  },

  // POST /role-info (Step 4)
  roleInfo: {
    body: Joi.object({
      role: Joi.string().max(100).allow(null, ''),
      functions: Joi.array().items(Joi.string()).default([]),
      useCases: Joi.array().items(Joi.string()).default([]),
    }),
  },

  // POST /project-setup (Steps 5-7)
  projectSetup: {
    body: Joi.object({
      projectName: Joi.string().min(1).max(200).required().messages({
        'string.min': 'Project name cannot be empty',
        'string.max': 'Project name must not exceed 200 characters',
        'any.required': 'Project name is required',
      }),
      tasks: Joi.array().items(
        Joi.object({
          title: Joi.string().required(),
          sectionName: Joi.string().allow(null, ''),
        })
      ).default([]),
      sections: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          position: Joi.number().integer().min(0),
        })
      ).default([]),
    }),
  },

  // POST /layout (Step 8)
  layout: {
    body: Joi.object({
      layout: Joi.string().valid('LIST', 'BOARD', 'TIMELINE', 'CALENDAR').required().messages({
        'any.only': 'Layout must be one of: LIST, BOARD, TIMELINE, CALENDAR',
        'any.required': 'Layout is required',
      }),
    }),
  },

  // POST /complete (Step 9)
  complete: {
    body: Joi.object({
      inviteEmails: Joi.array().items(
        Joi.string().email().messages({
          'string.email': 'Each invite must be a valid email address',
        })
      ).default([]).required(),
    }),
  },
};

module.exports = onboardingValidators;
