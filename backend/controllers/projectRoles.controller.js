const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { projectMemberRoles } = require('../prisma/seeds/projectMemberRoles.seed');

/**
 * ProjectRoles Controller
 * Handles project role definitions and permissions
 */

class ProjectRolesController {
  /**
   * @route   GET /api/v1/project-roles
   * @desc    Get all available project member roles
   * @access  Public (authenticated users can see available roles)
   */
  static getRoles = asyncHandler(async (req, res) => {
    ApiResponse.success(
      projectMemberRoles,
      'Project roles retrieved successfully'
    ).send(res);
  });

  /**
   * @route   GET /api/v1/project-roles/:roleValue
   * @desc    Get specific role details
   * @access  Public
   */
  static getRole = asyncHandler(async (req, res) => {
    const { roleValue } = req.params;

    const role = projectMemberRoles.find(r => r.value === roleValue.toUpperCase());

    if (!role) {
      throw ApiError.notFound('Role not found');
    }

    ApiResponse.success(role, 'Role retrieved successfully').send(res);
  });

  /**
   * @route   GET /api/v1/project-roles/default
   * @desc    Get default role for new members
   * @access  Public
   */
  static getDefaultRole = asyncHandler(async (req, res) => {
    const defaultRole = projectMemberRoles.find(r => r.isDefault);

    ApiResponse.success(defaultRole, 'Default role retrieved successfully').send(res);
  });
}

module.exports = ProjectRolesController;
