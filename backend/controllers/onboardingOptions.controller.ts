const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Onboarding Options Controller
 * Handles fetching dynamic options for onboarding steps
 */

class OnboardingOptionsController {
  /**
   * @route   GET /api/v1/onboarding/options/app-usage
   * @desc    Get all active app usage options
   * @access  Public
   */
  static getAppUsageOptions = asyncHandler(async (req, res) => {
    const options = await prisma.appUsageOption.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        label: true,
        value: true,
        description: true,
        icon: true,
      },
    });

    ApiResponse.success(options, 'App usage options retrieved').send(res);
  });

  /**
   * @route   GET /api/v1/onboarding/options/industries
   * @desc    Get all active industry options
   * @access  Public
   */
  static getIndustryOptions = asyncHandler(async (req, res) => {
    const options = await prisma.industryOption.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        label: true,
        value: true,
        description: true,
        icon: true,
      },
    });

    ApiResponse.success(options, 'Industry options retrieved').send(res);
  });

  /**
   * @route   GET /api/v1/onboarding/options/team-sizes
   * @desc    Get all active team size options
   * @access  Public
   */
  static getTeamSizeOptions = asyncHandler(async (req, res) => {
    const options = await prisma.teamSizeOption.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        label: true,
        value: true,
        description: true,
        minSize: true,
        maxSize: true,
      },
    });

    ApiResponse.success(options, 'Team size options retrieved').send(res);
  });

  /**
   * @route   GET /api/v1/onboarding/options/roles
   * @desc    Get all active role options
   * @access  Public
   */
  static getRoleOptions = asyncHandler(async (req, res) => {
    const options = await prisma.roleOption.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        label: true,
        value: true,
        description: true,
        icon: true,
      },
    });

    ApiResponse.success(options, 'Role options retrieved').send(res);
  });

  /**
   * @route   GET /api/v1/onboarding/options/all
   * @desc    Get all onboarding options in one call
   * @access  Public
   */
  static getAllOptions = asyncHandler(async (req, res) => {
    const [appUsage, industries, teamSizes, roles] = await Promise.all([
      prisma.appUsageOption.findMany({
        where: { isActive: true },
        orderBy: { position: 'asc' },
        select: { id: true, label: true, value: true, description: true, icon: true },
      }),
      prisma.industryOption.findMany({
        where: { isActive: true },
        orderBy: { position: 'asc' },
        select: { id: true, label: true, value: true, description: true, icon: true },
      }),
      prisma.teamSizeOption.findMany({
        where: { isActive: true },
        orderBy: { position: 'asc' },
        select: { id: true, label: true, value: true, description: true, minSize: true, maxSize: true },
      }),
      prisma.roleOption.findMany({
        where: { isActive: true },
        orderBy: { position: 'asc' },
        select: { id: true, label: true, value: true, description: true, icon: true },
      }),
    ]);

    ApiResponse.success(
      {
        appUsage,
        industries,
        teamSizes,
        roles,
      },
      'All onboarding options retrieved'
    ).send(res);
  });
}

module.exports = OnboardingOptionsController;
