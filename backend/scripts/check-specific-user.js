const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const email = 'akhiljithu004@gmail.com';

  console.log('\n=== Checking User:', email, '===\n');

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      projectMembers: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      tenantUsers: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    console.log('❌ User not found in database');
    return;
  }

  console.log('✅ User found:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Full Name:', user.fullName || 'NULL');
  console.log('   Avatar URL:', user.avatarUrl || 'NULL');
  console.log('   Email Verified:', user.isEmailVerified);
  console.log('   Created:', user.createdAt);
  console.log('');

  console.log('Project Memberships:', user.projectMembers.length);
  user.projectMembers.forEach((pm, i) => {
    console.log(`   ${i + 1}. ${pm.project.name} (${pm.role})`);
  });
  console.log('');

  console.log('Tenant Memberships:', user.tenantUsers.length);
  user.tenantUsers.forEach((tu, i) => {
    console.log(`   ${i + 1}. ${tu.tenant.name} (${tu.role})`);
  });
  console.log('');

  // Check invitations
  const invitations = await prisma.invitation.findMany({
    where: { email },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  console.log('Invitations:', invitations.length);
  invitations.forEach((inv, i) => {
    console.log(`   ${i + 1}. ${inv.type} - ${inv.project?.name || inv.tenant?.name}`);
    console.log(`      Status: ${inv.status}`);
    console.log(`      Role: ${inv.role}`);
    console.log(`      Project Role: ${inv.projectRole || 'N/A'}`);
  });

  await prisma.$disconnect();
}

checkUser()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
