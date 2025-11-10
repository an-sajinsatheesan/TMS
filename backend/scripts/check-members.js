const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMembers() {
  console.log('\n=== Checking ProjectMembers ===\n');

  const projectMembers = await prisma.projectMember.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          isEmailVerified: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      joinedAt: 'desc',
    },
    take: 10,
  });

  console.log(`Found ${projectMembers.length} project members:\n`);

  projectMembers.forEach((member, index) => {
    console.log(`${index + 1}. Project: ${member.project.name}`);
    console.log(`   User: ${member.user?.fullName || member.user?.email || 'NULL'}`);
    console.log(`   Email: ${member.user?.email || 'NULL'}`);
    console.log(`   Email Verified: ${member.user?.isEmailVerified}`);
    console.log(`   Role: ${member.role}`);
    console.log(`   Joined: ${member.joinedAt}`);
    console.log('');
  });

  console.log('\n=== Checking Pending Invitations ===\n');

  const pendingInvitations = await prisma.invitation.findMany({
    where: {
      status: 'PENDING',
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      inviter: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });

  console.log(`Found ${pendingInvitations.length} pending invitations:\n`);

  pendingInvitations.forEach((inv, index) => {
    console.log(`${index + 1}. Project: ${inv.project?.name || inv.type}`);
    console.log(`   Email: ${inv.email}`);
    console.log(`   Role: ${inv.projectRole || inv.role}`);
    console.log(`   Status: ${inv.status}`);
    console.log(`   Invited by: ${inv.inviter?.fullName || inv.inviter?.email}`);
    console.log(`   Expires: ${inv.expiresAt}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkMembers()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
