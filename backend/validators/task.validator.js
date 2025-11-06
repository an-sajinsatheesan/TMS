const Joi = require('joi');

/**
 * Validation schema for creating a task
 */
const createTaskSchema = Joi.object({
  title: Joi.string().allow('').max(200).optional().messages({
    'string.max': 'Task title cannot exceed 200 characters',
  }),
  description: Joi.string().allow('').max(5000).optional(),
  sectionId: Joi.string().uuid().allow(null).optional(),
  type: Joi.string().valid('TASK', 'MILESTONE').default('TASK'),
  assigneeId: Joi.string().uuid().allow(null).optional(),
  startDate: Joi.date().iso().allow(null).optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
  priority: Joi.string().allow(null).optional(),
  status: Joi.string().allow(null).optional(),
  approvalStatus: Joi.string().allow(null).optional(),
  tags: Joi.array().items(Joi.string()).default([]),
  customFields: Joi.object().optional(),
  parentId: Joi.string().uuid().allow(null).optional(),
});

/**
 * Validation schema for updating a task
 */
const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  name: Joi.string().min(1).max(200).optional(), // Alias for title (frontend compatibility)
  description: Joi.string().allow('').max(5000).optional(),
  sectionId: Joi.string().uuid().allow(null).optional(),
  type: Joi.string().valid('TASK', 'MILESTONE').optional(),
  completed: Joi.boolean().optional(),
  assigneeId: Joi.string().uuid().allow(null).optional(),
  startDate: Joi.date().iso().allow(null).optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
  priority: Joi.string().allow(null).optional(),
  status: Joi.string().allow(null).optional(),
  approvalStatus: Joi.string().allow(null).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  customFields: Joi.object().optional(),
  orderIndex: Joi.number().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Validation schema for listing tasks
 */
const listTasksSchema = Joi.object({
  sectionId: Joi.string().uuid().optional(),
  assigneeId: Joi.string().uuid().optional(),
  priority: Joi.string().optional(),
  status: Joi.string().optional(),
  completed: Joi.boolean().optional(),
  search: Joi.string().optional(),
  parentId: Joi.string().uuid().allow(null).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(1000).default(100),
});

/**
 * Validation schema for moving a task
 */
const moveTaskSchema = Joi.object({
  toSectionId: Joi.string().uuid().allow(null).required().messages({
    'any.required': 'Target section ID is required',
  }),
  orderIndex: Joi.number().allow(null).optional(),
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

    req.query = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  createTaskSchema,
  updateTaskSchema,
  listTasksSchema,
  moveTaskSchema,
};
