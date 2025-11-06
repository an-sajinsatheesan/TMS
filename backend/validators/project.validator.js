const Joi = require('joi');

/**
 * Validation schema for creating a project
 */
const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Project name is required',
    'string.min': 'Project name must be at least 1 character',
    'string.max': 'Project name cannot exceed 100 characters',
  }),
  layout: Joi.string().valid('LIST', 'BOARD', 'TIMELINE', 'CALENDAR').default('BOARD').messages({
    'any.only': 'Layout must be one of: LIST, BOARD, TIMELINE, CALENDAR',
  }),
  sections: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().min(1).max(50).required(),
        color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
      })
    )
    .optional()
    .default([]),
  tasks: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().min(1).max(200).required(),
        sectionName: Joi.string().required(),
      })
    )
    .optional()
    .default([]),
  inviteEmails: Joi.array()
    .items(Joi.string().email())
    .optional()
    .default([]),
});

/**
 * Validation schema for updating a project
 */
const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.empty': 'Project name cannot be empty',
    'string.min': 'Project name must be at least 1 character',
    'string.max': 'Project name cannot exceed 100 characters',
  }),
  layout: Joi.string().valid('LIST', 'BOARD', 'TIMELINE', 'CALENDAR').optional().messages({
    'any.only': 'Layout must be one of: LIST, BOARD, TIMELINE, CALENDAR',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Validation schema for listing projects
 */
const listProjectsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('createdAt', 'updatedAt', 'name').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

/**
 * Validation schema for inviting members to project
 */
const inviteMembersSchema = Joi.object({
  emails: Joi.array()
    .items(Joi.string().email())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one email is required',
      'string.email': 'Invalid email format',
    }),
  role: Joi.string().valid('MEMBER', 'VIEWER').default('MEMBER').messages({
    'any.only': 'Role must be either MEMBER or VIEWER',
  }),
});

/**
 * Validation schema for updating member role
 */
const updateMemberRoleSchema = Joi.object({
  role: Joi.string().valid('OWNER', 'ADMIN', 'MEMBER', 'VIEWER').required().messages({
    'any.only': 'Role must be one of: OWNER, ADMIN, MEMBER, VIEWER',
    'any.required': 'Role is required',
  }),
});

/**
 * Middleware to validate request body against schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

/**
 * Middleware to validate query parameters against schema
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    // Replace req.query with validated and sanitized value
    req.query = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
  inviteMembersSchema,
  updateMemberRoleSchema,
};
