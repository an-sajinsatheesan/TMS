const Joi = require('joi');

/**
 * Validation schema for creating a project column
 */
const createColumnSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Column name is required',
    'string.max': 'Column name cannot exceed 100 characters',
  }),
  type: Joi.string().valid('text', 'date', 'select', 'multiselect', 'user', 'number', 'checkbox').required().messages({
    'any.only': 'Column type must be one of: text, date, select, multiselect, user, number, checkbox',
  }),
  width: Joi.number().integer().min(50).max(500).optional().default(150),
  visible: Joi.boolean().optional().default(true),
  options: Joi.array().items(
    Joi.object({
      label: Joi.string().required(),
      value: Joi.string().required(),
      color: Joi.string().optional(),
    })
  ).optional(),
});

/**
 * Validation schema for updating a project column
 */
const updateColumnSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  type: Joi.string().valid('text', 'date', 'select', 'multiselect', 'user', 'number', 'checkbox').optional(),
  width: Joi.number().integer().min(50).max(500).optional(),
  visible: Joi.boolean().optional(),
  position: Joi.number().integer().min(0).optional(),
  options: Joi.array().items(
    Joi.object({
      label: Joi.string().required(),
      value: Joi.string().required(),
      color: Joi.string().optional(),
    })
  ).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Validation schema for reordering columns
 */
const reorderColumnsSchema = Joi.object({
  columnIds: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
    'array.min': 'At least one column ID is required',
    'any.required': 'Column IDs are required',
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
  createColumnSchema,
  updateColumnSchema,
  reorderColumnsSchema,
};
