const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkInvitation() {
  const invitation = await prisma.invitation.findUnique({
    where: { token: '781700c3-7f2d-446c-acf4-889444e00d0a' }
  });

  console.log('Invitation:', JSON.stringify(invitation, null, 2));
  await prisma.$disconnect();
}

checkInvitation();
