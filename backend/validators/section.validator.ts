const Joi = require('joi');

/**
 * Validation schema for creating a section
 */
const createSectionSchema = Joi.object({
  name: Joi.string().min(1).max(50).required().messages({
    'string.empty': 'Section name is required',
    'string.min': 'Section name must be at least 1 character',
    'string.max': 'Section name cannot exceed 50 characters',
  }),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().messages({
    'string.pattern.base': 'Color must be a valid hex color (e.g., #94a3b8)',
  }),
  position: Joi.number().integer().min(0).optional().messages({
    'number.min': 'Position must be a non-negative integer',
  }),
});

/**
 * Validation schema for updating a section
 */
const updateSectionSchema = Joi.object({
  name: Joi.string().min(1).max(50).optional().messages({
    'string.empty': 'Section name cannot be empty',
    'string.min': 'Section name must be at least 1 character',
    'string.max': 'Section name cannot exceed 50 characters',
  }),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().messages({
    'string.pattern.base': 'Color must be a valid hex color (e.g., #94a3b8)',
  }),
  position: Joi.number().integer().min(0).optional().messages({
    'number.min': 'Position must be a non-negative integer',
  }),
  isCollapsed: Joi.boolean().optional(),
  kanbanWipLimit: Joi.number().integer().min(1).allow(null).optional().messages({
    'number.min': 'WIP limit must be at least 1',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Validation schema for reordering sections
 */
const reorderSectionsSchema = Joi.object({
  sectionIds: Joi.array()
    .items(Joi.string().uuid())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one section ID is required',
      'string.guid': 'Invalid section ID format',
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

    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  createSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
};
