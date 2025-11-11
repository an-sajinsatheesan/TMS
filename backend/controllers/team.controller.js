const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * Team Controller
 * Handles team CRUD operations and member management
 */

class TeamController {
  /**
   * @route   GET /api/v1/teams
   * @desc    List all teams in tenant
   * @access  Private
   */
  static listTeams = asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;

    const teams = await prisma.team.findMany({
      where: { tenantId },
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    ApiResponse.success(teams, 'Teams retrieved successfully').send(res);
  });

  /**
   * @route   GET /api/v1/teams/:teamId
   * @desc    Get team details
   * @access  Private
   */
  static getTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const tenantId = req.user.tenantId;

    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        tenantId,
      },
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true,
          },
        },
      },
    });

    if (!team) {
      throw ApiError.notFound('Team not found');
    }

    // Get user details for members
    const memberUserIds = team.members.map((m) => m.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: memberUserIds } },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
      },
    });

    // Merge user data with member data
    const membersWithUsers = team.members.map((member) => ({
      ...member,
      user: users.find((u) => u.id === member.userId),
    }));

    ApiResponse.success(
      { ...team, members: membersWithUsers },
      'Team retrieved successfully'
    ).send(res);
  });

  /**
   * @route   POST /api/v1/teams
   * @desc    Create a new team
   * @access  Private
   */
  static createTeam = asyncHandler(async (req, res) => {
    const { name, description, color } = req.body;
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    if (!name) {
      throw ApiError.badRequest('Team name is required');
    }

    const team = await prisma.team.create({
      data: {
        id: uuidv4(),
        name,
        description: description || null,
        color: color || '#3b82f6',
        tenantId,
        createdBy: userId,
        members: {
          create: {
            id: uuidv4(),
            userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    ApiResponse.success(team, 'Team created successfully').send(res, 201);
  });

  /**
   * @route   PATCH /api/v1/teams/:teamId
   * @desc    Update team
   * @access  Private (requires ADMIN role)
   */
  static updateTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { name, description, color } = req.body;
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    // Check if user is team admin
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (!membership || membership.role !== 'ADMIN') {
      throw ApiError.forbidden('Only team admins can update team details');
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (color !== undefined) updates.color = color;

    const team = await prisma.team.update({
      where: {
        id: teamId,
        tenantId,
      },
      data: updates,
      include: {
        members: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    ApiResponse.success(team, 'Team updated successfully').send(res);
  });

  /**
   * @route   DELETE /api/v1/teams/:teamId
   * @desc    Delete team
   * @access  Private (requires ADMIN role)
   */
  static deleteTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    // Check if user is team admin
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (!membership || membership.role !== 'ADMIN') {
      throw ApiError.forbidden('Only team admins can delete the team');
    }

    await prisma.team.delete({
      where: {
        id: teamId,
        tenantId,
      },
    });

    ApiResponse.success(null, 'Team deleted successfully').send(res);
  });

  /**
   * @route   GET /api/v1/teams/:teamId/available-members
   * @desc    Get available users to add to team (tenant members not in team)
   * @access  Private
   */
  static getAvailableMembers = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { search } = req.query;
    const tenantId = req.user.tenantId;

    // Verify team belongs to tenant
    const team = await prisma.team.findFirst({
      where: { id: teamId, tenantId },
    });

    if (!team) {
      throw ApiError.notFound('Team not found');
    }

    // Get current team member IDs
    const teamMembers = await prisma.teamMember.findMany({
      where: { teamId },
      select: { userId: true },
    });

    const teamMemberIds = teamMembers.map((m) => m.userId);

    // Build where clause for search
    const whereClause = {
      tenantId,
      userId: {
        notIn: teamMemberIds.length > 0 ? teamMemberIds : undefined,
      },
    };

    // Get all tenant users not in team
    const availableUsers = await prisma.tenant_users.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    // Filter by search if provided
    let filteredUsers = availableUsers.map((tu) => tu.users);

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    ApiResponse.success(
      filteredUsers,
      'Available members retrieved successfully'
    ).send(res);
  });

  /**
   * @route   GET /api/v1/teams/:teamId/members
   * @desc    Get team members
   * @access  Private
   */
  static getTeamMembers = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const tenantId = req.user.tenantId;

    // Verify team belongs to tenant
    const team = await prisma.team.findFirst({
      where: { id: teamId, tenantId },
    });

    if (!team) {
      throw ApiError.notFound('Team not found');
    }

    const members = await prisma.teamMember.findMany({
      where: { teamId },
    });

    // Get user details
    const userIds = members.map((m) => m.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
      },
    });

    // Merge data
    const membersWithUsers = members.map((member) => ({
      ...member,
      user: users.find((u) => u.id === member.userId),
    }));

    ApiResponse.success(membersWithUsers, 'Team members retrieved successfully').send(res);
  });

  /**
   * @route   POST /api/v1/teams/:teamId/members
   * @desc    Add member to team
   * @access  Private (requires ADMIN role)
   */
  static addTeamMember = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { userId: memberUserId, role } = req.body;
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    // Validate role
    const validRoles = ['ADMIN', 'MEMBER'];
    if (role && !validRoles.includes(role)) {
      throw ApiError.badRequest(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Check if requester is team admin
    const requesterMembership = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    });

    if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
      throw ApiError.forbidden('Only team admins can add members');
    }

    // Verify team belongs to tenant
    const team = await prisma.team.findFirst({
      where: { id: teamId, tenantId },
    });

    if (!team) {
      throw ApiError.notFound('Team not found');
    }

    // Check if user is in the same tenant
    const targetUser = await prisma.tenant_users.findFirst({
      where: {
        userId: memberUserId,
        tenantId,
      },
    });

    if (!targetUser) {
      throw ApiError.badRequest('User is not part of this workspace');
    }

    // Check if already a member
    const existing = await prisma.teamMember.findFirst({
      where: { teamId, userId: memberUserId },
    });

    if (existing) {
      throw ApiError.badRequest('User is already a team member');
    }

    const member = await prisma.teamMember.create({
      data: {
        id: uuidv4(),
        teamId,
        userId: memberUserId,
        role: role || 'MEMBER',
      },
    });

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: memberUserId },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
      },
    });

    ApiResponse.success(
      { ...member, user },
      'Member added to team successfully'
    ).send(res, 201);
  });

  /**
   * @route   PATCH /api/v1/teams/:teamId/members/:memberId
   * @desc    Update team member role
   * @access  Private (requires ADMIN role)
   */
  static updateTeamMemberRole = asyncHandler(async (req, res) => {
    const { teamId, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user.id;

    // Validate role
    const validRoles = ['ADMIN', 'MEMBER'];
    if (!validRoles.includes(role)) {
      throw ApiError.badRequest(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Check if requester is team admin
    const requesterMembership = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    });

    if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
      throw ApiError.forbidden('Only team admins can update member roles');
    }

    // Ensure at least one admin remains
    if (role !== 'ADMIN') {
      const adminCount = await prisma.teamMember.count({
        where: { teamId, role: 'ADMIN' },
      });

      const targetMember = await prisma.teamMember.findUnique({
        where: { id: memberId },
      });

      if (targetMember?.role === 'ADMIN' && adminCount <= 1) {
        throw ApiError.badRequest('Cannot demote the last admin. Promote another member first.');
      }
    }

    const member = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role },
    });

    ApiResponse.success(member, 'Member role updated successfully').send(res);
  });

  /**
   * @route   DELETE /api/v1/teams/:teamId/members/:memberId
   * @desc    Remove member from team
   * @access  Private (requires ADMIN role)
   */
  static removeTeamMember = asyncHandler(async (req, res) => {
    const { teamId, memberId } = req.params;
    const userId = req.user.id;

    // Check if requester is team admin
    const requesterMembership = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    });

    if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
      throw ApiError.forbidden('Only team admins can remove members');
    }

    // Check if member exists
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw ApiError.notFound('Member not found');
    }

    // Prevent removing last admin
    if (member.role === 'ADMIN') {
      const adminCount = await prisma.teamMember.count({
        where: { teamId, role: 'ADMIN' },
      });

      if (adminCount <= 1) {
        throw ApiError.badRequest('Cannot remove the last admin. Promote another member first.');
      }
    }

    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    ApiResponse.success(null, 'Member removed from team successfully').send(res);
  });
}

module.exports = TeamController;
