const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Seed Project Member Roles
 * These are the available roles for project members (like Asana/Monday.com)
 */

const projectMemberRoles = [
  {
    value: 'OWNER',
    label: 'Owner',
    description: 'Full access to project settings and can delete project',
    permissions: {
      canEdit: true,
      canDelete: true,
      canInvite: true,
      canManageMembers: true,
      canManageSettings: true,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canViewTasks: true,
      canComment: true,
    },
    color: '#f59e0b', // Amber
    icon: 'Crown',
    position: 0,
    isDefault: false,
  },
  {
    value: 'ADMIN',
    label: 'Admin',
    description: 'Can manage project members and settings',
    permissions: {
      canEdit: true,
      canDelete: false,
      canInvite: true,
      canManageMembers: true,
      canManageSettings: true,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canViewTasks: true,
      canComment: true,
    },
    color: '#8b5cf6', // Purple
    icon: 'Shield',
    position: 1,
    isDefault: false,
  },
  {
    value: 'MEMBER',
    label: 'Member',
    description: 'Can create and edit tasks',
    permissions: {
      canEdit: false,
      canDelete: false,
      canInvite: false,
      canManageMembers: false,
      canManageSettings: false,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: false,
      canViewTasks: true,
      canComment: true,
    },
    color: '#3b82f6', // Blue
    icon: 'Users',
    position: 2,
    isDefault: true, // Default role for new invitations
  },
  {
    value: 'VIEWER',
    label: 'Viewer',
    description: 'Can only view tasks and comments',
    permissions: {
      canEdit: false,
      canDelete: false,
      canInvite: false,
      canManageMembers: false,
      canManageSettings: false,
      canCreateTasks: false,
      canEditTasks: false,
      canDeleteTasks: false,
      canViewTasks: true,
      canComment: true,
    },
    color: '#6b7280', // Gray
    icon: 'Eye',
    position: 3,
    isDefault: false,
  },
];

async function seedProjectMemberRoles() {
  console.log('🌱 Seeding Project Member Roles...');

  try {
    // Note: Since we're using enum ProjectRole in schema, we don't create a table
    // This data will be returned by the API from this constant

    console.log(`✅ Project Member Roles defined: ${projectMemberRoles.length} roles`);
    console.log('   Roles:', projectMemberRoles.map(r => r.label).join(', '));

    return projectMemberRoles;
  } catch (error) {
    console.error('❌ Error defining project member roles:', error);
    throw error;
  }
}

// Export for use in API
module.exports = { projectMemberRoles, seedProjectMemberRoles };

// Run if called directly
if (require.main === module) {
  seedProjectMemberRoles()
    .then(() => {
      console.log('✅ Project Member Roles seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}
