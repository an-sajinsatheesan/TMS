const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAPIResponse() {
  console.log('\n=== Testing API Response for Project Members ===\n');

  // Find the project
  const project = await prisma.project.findFirst({
    where: {
      name: 'Licence and Enforcement System',
    },
  });

  if (!project) {
    console.log('Project not found');
    return;
  }

  console.log('Project ID:', project.id);
  console.log('Project Name:', project.name);
  console.log('');

  // Simulate the API call
  const members = await prisma.projectMember.findMany({
    where: { projectId: project.id },
    orderBy: { joinedAt: 'asc' },
    select: {
      id: true,
      projectId: true,
      userId: true,
      role: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  console.log('=== Active Members ===');
  console.log('Total:', members.length);
  console.log('');

  members.forEach((member, i) => {
    console.log(`${i + 1}. Member ID: ${member.id}`);
    console.log(`   User ID: ${member.userId}`);
    console.log(`   Role: ${member.role}`);
    console.log(`   User Data:`);
    console.log(`     - Full Name: ${member.user?.fullName || 'NULL'}`);
    console.log(`     - Email: ${member.user?.email || 'NULL'}`);
    console.log(`     - Avatar URL: ${member.user?.avatarUrl || 'NULL'}`);
    console.log(`   Joined: ${member.joinedAt}`);
    console.log('');
  });

  // Get pending invitations
  const pendingInvitations = await prisma.invitation.findMany({
    where: {
      projectId: project.id,
      status: 'PENDING',
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      projectRole: true,
      createdAt: true,
      inviter: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });

  console.log('=== Pending Invitations ===');
  console.log('Total:', pendingInvitations.length);
  console.log('');

  pendingInvitations.forEach((inv, i) => {
    console.log(`${i + 1}. Email: ${inv.email}`);
    console.log(`   Role: ${inv.projectRole}`);
    console.log(`   Invited by: ${inv.inviter?.fullName || inv.inviter?.email}`);
    console.log('');
  });

  // Formatted response (what frontend receives)
  const formattedInvitations = pendingInvitations.map(inv => ({
    id: inv.id,
    projectId: project.id,
    userId: null,
    role: inv.projectRole,
    joinedAt: inv.createdAt,
    isPending: true,
    user: {
      id: null,
      fullName: null,
      email: inv.email,
      avatarUrl: null,
    },
    invitedBy: inv.inviter,
  }));

  const allMembers = [...members, ...formattedInvitations];

  console.log('=== Combined Response (API Returns) ===');
  console.log('Total entries:', allMembers.length);
  console.log(JSON.stringify(allMembers, null, 2));

  await prisma.$disconnect();
}

testAPIResponse()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
