const prisma = require('../config/prisma');

/**
 * Migration Script: Fix Onboarding Status for Invited Users
 *
 * This script identifies users who joined via invitation but have incomplete
 * onboarding data, and marks their onboarding as complete.
 *
 * Run with: node scripts/fix-invited-users-onboarding.js
 */

async function fixInvitedUsersOnboarding() {
  console.log('🔍 Finding users who joined via invitation...\n');

  try {
    // Find all users who have tenant/project memberships but incomplete onboarding
    const usersWithMemberships = await prisma.user.findMany({
      where: {
        OR: [
          { tenant_users: { some: {} } },
          { project_members: { some: {} } },
        ],
      },
      include: {
        onboardingData: true,
        tenant_users: true,
        project_members: true,
        ownedTenants: true,
      },
    });

    console.log(`📊 Found ${usersWithMemberships.length} users with memberships\n`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const user of usersWithMemberships) {
      // Skip if user owns a tenant (they went through onboarding to create it)
      if (user.ownedTenants.length > 0) {
        skippedCount++;
        continue;
      }

      // Check if onboarding is incomplete
      if (!user.onboardingData) {
        // Create completed onboarding data
        await prisma.onboardingData.create({
          data: {
            userId: user.id,
            currentStep: 1,
            completedAt: new Date(),
          },
        });

        console.log(`✅ Created completed onboarding for: ${user.email}`);
        fixedCount++;
      } else if (!user.onboardingData.completedAt) {
        // Mark existing onboarding as complete
        await prisma.onboardingData.update({
          where: { userId: user.id },
          data: { completedAt: new Date() },
        });

        console.log(`✅ Marked onboarding complete for: ${user.email}`);
        fixedCount++;
      } else {
        // Already has completed onboarding
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Migration complete!`);
    console.log(`📝 Fixed: ${fixedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users (already complete or tenant owners)`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
fixInvitedUsersOnboarding()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
