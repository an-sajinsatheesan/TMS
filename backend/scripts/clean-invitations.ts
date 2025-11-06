const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanInvitations() {
  try {
    console.log('Checking invitations in database...\n');

    // Get all invitations
    const allInvitations = await prisma.invitation.findMany({
      include: {
        tenant: true,
        inviter: true,
      },
    });

    console.log(`Total invitations found: ${allInvitations.length}\n`);

    if (allInvitations.length > 0) {
      console.log('Invitation Details:');
      allInvitations.forEach((inv, index) => {
        console.log(`\n${index + 1}. Email: ${inv.email}`);
        console.log(`   Status: ${inv.status}`);
        console.log(`   Type: ${inv.type}`);
        console.log(`   Token: ${inv.token.substring(0, 10)}...`);
        console.log(`   Expires: ${inv.expiresAt}`);
        console.log(`   Created: ${inv.createdAt}`);
      });

      // Count by status
      const pending = allInvitations.filter(i => i.status === 'PENDING').length;
      const accepted = allInvitations.filter(i => i.status === 'ACCEPTED').length;
      const expired = allInvitations.filter(i => i.status === 'EXPIRED').length;

      console.log('\n\nSummary:');
      console.log(`  PENDING: ${pending}`);
      console.log(`  ACCEPTED: ${accepted}`);
      console.log(`  EXPIRED: ${expired}`);

      // Option to delete non-pending invitations
      if (accepted > 0 || expired > 0) {
        console.log('\n⚠️  Found non-PENDING invitations!');
        console.log('\nDeleting ACCEPTED and EXPIRED invitations...');

        const deleted = await prisma.invitation.deleteMany({
          where: {
            status: {
              in: ['ACCEPTED', 'EXPIRED']
            }
          }
        });
        console.log(`\n✅ Deleted ${deleted.count} non-pending invitations`);
        console.log('   You can now send fresh invitations!');
      }
    } else {
      console.log('✅ No invitations found in database.');
      console.log('   This is expected after a fresh database reset.');
      console.log('   You need to complete onboarding and send new invitations.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanInvitations();
