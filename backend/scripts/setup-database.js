/**
 * Complete database setup script
 * Runs migrations and seeds
 */

const runMigration = require('./migrate');
const {
  seedConsolidatedOptions,
  seedTaskStatusOptions,
  seedTaskPriorityOptions,
  seedSubscriptionPlans
} = require('../prisma/seeds/consolidatedOptions.seed');

async function setupDatabase() {
  try {
    console.log('=== Starting Database Setup ===\n');

    // Step 1: Run migrations
    console.log('Step 1: Running migrations...');
    await runMigration();
    console.log('');

    // Step 2: Seed data
    console.log('Step 2: Seeding data...');
    await seedConsolidatedOptions();
    await seedTaskStatusOptions();
    await seedTaskPriorityOptions();
    await seedSubscriptionPlans();
    console.log('');

    console.log('=== Database Setup Complete ===');
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
}

if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('\n✓ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;
