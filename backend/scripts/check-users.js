const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        isSuperAdmin: true,
        createdAt: true,
      },
    });

    console.log('👥 Users in database:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Super Admin: ${user.isSuperAdmin}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt}\n`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
