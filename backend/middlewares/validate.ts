const ApiError = require('../utils/ApiError');

/**
 * Validation Middleware
 * Validates request data against Joi schemas
 *
 * Usage:
 * router.post('/login', validate(authValidators.login), authController.login);
 */

const validate = (schema) => (req, res, next) => {
  const validationOptions = {
    abortEarly: false, // Return all errors, not just the first one
    allowUnknown: true, // Allow unknown keys that will be ignored
    stripUnknown: true, // Remove unknown keys from the validated data
  };

  const { error, value } = schema.body
    ? schema.body.validate(req.body, validationOptions)
    : { error: null, value: req.body };

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    return next(ApiError.badRequest(errorMessage));
  }

  // Replace request data with validated and sanitized data
  Object.assign(req, value);
  return next();
};

module.exports = validate;
