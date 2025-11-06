const Joi = require('joi');

/**
 * Validation schema for creating a comment
 */
const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required().messages({
    'string.empty': 'Comment content is required',
    'string.min': 'Comment must be at least 1 character',
    'string.max': 'Comment cannot exceed 5000 characters',
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
  createCommentSchema,
};
