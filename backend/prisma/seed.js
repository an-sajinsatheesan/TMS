const { seedStaticTaskOptions } = require('./seeds/staticTaskOptions.seed');
const { seedTemplates } = require('./seeds/templates.seed');
const { seedConsolidatedOptions } = require('./seeds/consolidatedOptions.seed');

/**
 * Master Seed Script
 * Runs all seed scripts in the correct order
 */

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Seed onboarding options
    console.log('1/3 Onboarding Options');
    await seedConsolidatedOptions();
    console.log('');

    // 2. Seed static task options
    console.log('2/3 Static Task Options');
    await seedStaticTaskOptions();
    console.log('');

    // 3. Seed global templates
    console.log('3/3 Global Templates');
    await seedTemplates();
    console.log('');

    console.log('✨ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  });
