const Joi = require('joi');

/**
 * Tenant Validators
 * Joi schemas for tenant/workspace endpoints
 */

const tenantValidators = {
  // PATCH /:tenantId/settings
  updateSettings: {
    body: Joi.object({
      name: Joi.string().min(1).max(200).messages({
        'string.min': 'Tenant name cannot be empty',
        'string.max': 'Tenant name must not exceed 200 characters',
      }),
      emailConfig: Joi.object().allow(null),
      messageConfig: Joi.object().allow(null),
      productKey: Joi.string().allow(null, ''),
    }).min(1).messages({
      'object.min': 'At least one field must be provided for update',
    }),
  },
};

module.exports = tenantValidators;
