const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PROJECT_ID = 'f912579a-2c9d-46f0-a8f5-9207ebe4f72a';
const USER_ID = 'cabcb571-735e-4dd6-833c-f708396002d3';

async function diagnoseProject() {
  console.log('\n========================================');
  console.log('🔍 PROJECT MEMBERSHIP DIAGNOSIS');
  console.log('========================================\n');

  // 1. Get Project Info
  const project = await prisma.project.findUnique({
    where: { id: PROJECT_ID },
    select: {
      id: true,
      name: true,
      tenantId: true,
      createdBy: true,
      createdAt: true,
    },
  });

  if (!project) {
    console.log('❌ Project not found!');
    await prisma.$disconnect();
    return;
  }

  console.log('📁 PROJECT DETAILS:');
  console.log(`   Name: ${project.name}`);
  console.log(`   ID: ${project.id}`);
  console.log(`   Tenant ID: ${project.tenantId}`);
  console.log(`   Created By: ${project.createdBy}`);
  console.log(`   Created At: ${project.createdAt}`);
  console.log('');

  // 2. Get User Info
  const user = await prisma.user.findUnique({
    where: { id: USER_ID },
    select: {
      id: true,
      email: true,
      fullName: true,
      isEmailVerified: true,
    },
  });

  console.log('👤 USER DETAILS (from URL):');
  if (user) {
    console.log(`   Name: ${user.fullName || 'Not set'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email Verified: ${user.isEmailVerified}`);
  } else {
    console.log('   ❌ User not found!');
  }
  console.log('');

  // 3. Get ALL Project Members
  const projectMembers = await prisma.project_members.findMany({
    where: { projectId: PROJECT_ID },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  console.log(`📊 PROJECT MEMBERS (${projectMembers.length} total):`);
  if (projectMembers.length === 0) {
    console.log('   ⚠️  NO PROJECT MEMBERS FOUND!');
    console.log('   ⚠️  This means the project creator was not added to project_members!');
  } else {
    projectMembers.forEach((m, i) => {
      const isCurrentUser = m.userId === USER_ID ? '👈 THIS IS YOU' : '';
      const isCreator = m.userId === project.createdBy ? '👑 CREATOR' : '';
      console.log(`   ${i + 1}. ${m.user.email} (${m.user.fullName || 'N/A'})`);
      console.log(`      Role: ${m.role} ${isCreator} ${isCurrentUser}`);
      console.log(`      User ID: ${m.userId}`);
      console.log(`      Joined: ${m.joinedAt}`);
    });
  }
  console.log('');

  // 4. Get Tenant Members
  const tenantMembers = await prisma.tenant_users.findMany({
    where: { tenantId: project.tenantId },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  console.log(`📊 TENANT MEMBERS (${tenantMembers.length} total):`);
  if (tenantMembers.length === 0) {
    console.log('   ⚠️  NO TENANT MEMBERS FOUND!');
  } else {
    tenantMembers.forEach((m, i) => {
      const isCurrentUser = m.userId === USER_ID ? '👈 THIS IS YOU' : '';
      const isCreator = m.userId === project.createdBy ? '👑 CREATOR' : '';
      console.log(`   ${i + 1}. ${m.users.email} (${m.users.fullName || 'N/A'})`);
      console.log(`      Role: ${m.role} ${isCreator} ${isCurrentUser}`);
      console.log(`      User ID: ${m.userId}`);
      console.log(`      Joined: ${m.joinedAt}`);
    });
  }
  console.log('');

  // 5. Get Invitations (both pending and accepted)
  const invitations = await prisma.invitation.findMany({
    where: {
      OR: [
        { projectId: PROJECT_ID },
        { tenantId: project.tenantId },
      ],
    },
    include: {
      inviter: {
        select: {
          email: true,
          fullName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log(`📧 INVITATIONS (${invitations.length} recent):`);
  if (invitations.length === 0) {
    console.log('   No invitations found');
  } else {
    invitations.forEach((inv, i) => {
      const type = inv.projectId ? 'PROJECT' : 'TENANT';
      console.log(`   ${i + 1}. ${inv.email}`);
      console.log(`      Type: ${type}`);
      console.log(`      Status: ${inv.status}`);
      console.log(`      Role: ${inv.role || inv.projectRole}`);
      console.log(`      Invited by: ${inv.inviter.email}`);
      console.log(`      Created: ${inv.createdAt}`);
      console.log(`      Expires: ${inv.expiresAt}`);
    });
  }
  console.log('');

  // 6. DIAGNOSIS
  console.log('========================================');
  console.log('🔬 DIAGNOSIS:');
  console.log('========================================');

  const userInProjectMembers = projectMembers.some(m => m.userId === USER_ID);
  const userInTenantMembers = tenantMembers.some(m => m.userId === USER_ID);
  const creatorInProjectMembers = projectMembers.some(m => m.userId === project.createdBy);
  const creatorInTenantMembers = tenantMembers.some(m => m.userId === project.createdBy);

  console.log(`\n✓ Current User (${user?.email || USER_ID}):`);
  console.log(`   - In project_members: ${userInProjectMembers ? '✅ YES' : '❌ NO'}`);
  console.log(`   - In tenant_users: ${userInTenantMembers ? '✅ YES' : '❌ NO'}`);

  console.log(`\n✓ Project Creator:`);
  console.log(`   - In project_members: ${creatorInProjectMembers ? '✅ YES' : '❌ NO'}`);
  console.log(`   - In tenant_users: ${creatorInTenantMembers ? '✅ YES' : '❌ NO'}`);

  console.log('\n========================================');
  console.log('💡 ISSUES FOUND:');
  console.log('========================================\n');

  const issues = [];

  if (!creatorInProjectMembers) {
    issues.push('❌ CRITICAL: Project creator is NOT in project_members table!');
    issues.push('   This means when the project was created, the creator was not added.');
    issues.push('   FIX: Add creator to project_members with OWNER role.');
  }

  if (!userInProjectMembers && !userInTenantMembers) {
    issues.push('❌ CRITICAL: Current user (you) is NOT in project_members OR tenant_users!');
    issues.push('   This means the invitation acceptance did not properly add you.');
    issues.push('   FIX: Add user to project_members or tenant_users.');
  }

  if (projectMembers.length === 0) {
    issues.push('❌ CRITICAL: NO project members at all!');
    issues.push('   The project_members table is completely empty for this project.');
  }

  if (issues.length === 0) {
    console.log('✅ No critical issues found!');
    console.log('   Both users are properly registered in the membership tables.');
  } else {
    issues.forEach(issue => console.log(issue));
  }

  console.log('\n========================================\n');

  await prisma.$disconnect();
}

diagnoseProject()
  .then(() => {
    console.log('Diagnosis complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
