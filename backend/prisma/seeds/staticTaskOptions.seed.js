const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Static Task Options Seed
 * Creates unified priority and status options with shared IDs across all tenants
 */

const taskOptions = [
  // PRIORITY OPTIONS
  {
    optionType: 'PRIORITY',
    label: 'Critical',
    value: 'critical',
    color: '#ef4444', // red-500
    icon: 'AlertCircle',
    description: 'Urgent and important - needs immediate attention',
    position: 0,
    isDefault: false,
  },
  {
    optionType: 'PRIORITY',
    label: 'High',
    value: 'high',
    color: '#f59e0b', // amber-500
    icon: 'ArrowUp',
    description: 'High priority - should be addressed soon',
    position: 1,
    isDefault: false,
  },
  {
    optionType: 'PRIORITY',
    label: 'Medium',
    value: 'medium',
    color: '#3b82f6', // blue-500
    icon: 'Minus',
    description: 'Normal priority',
    position: 2,
    isDefault: true,
  },
  {
    optionType: 'PRIORITY',
    label: 'Low',
    value: 'low',
    color: '#6b7280', // gray-500
    icon: 'ArrowDown',
    description: 'Low priority - can wait',
    position: 3,
    isDefault: false,
  },

  // STATUS OPTIONS
  {
    optionType: 'STATUS',
    label: 'To Do',
    value: 'todo',
    color: '#6b7280', // gray-500
    icon: 'Circle',
    description: 'Not started yet',
    position: 0,
    isDefault: true,
  },
  {
    optionType: 'STATUS',
    label: 'In Progress',
    value: 'in_progress',
    color: '#3b82f6', // blue-500
    icon: 'PlayCircle',
    description: 'Currently being worked on',
    position: 1,
    isDefault: false,
  },
  {
    optionType: 'STATUS',
    label: 'In Review',
    value: 'in_review',
    color: '#f59e0b', // amber-500
    icon: 'Eye',
    description: 'Under review or waiting for approval',
    position: 2,
    isDefault: false,
  },
  {
    optionType: 'STATUS',
    label: 'Blocked',
    value: 'blocked',
    color: '#ef4444', // red-500
    icon: 'XCircle',
    description: 'Blocked by external dependency',
    position: 3,
    isDefault: false,
  },
  {
    optionType: 'STATUS',
    label: 'Completed',
    value: 'completed',
    color: '#10b981', // green-500
    icon: 'CheckCircle',
    description: 'Task is finished',
    position: 4,
    isDefault: false,
  },
  {
    optionType: 'STATUS',
    label: 'Cancelled',
    value: 'cancelled',
    color: '#6b7280', // gray-500
    icon: 'Ban',
    description: 'Task was cancelled',
    position: 5,
    isDefault: false,
  },
];

/**
 * Seed static task options
 */
async function seedStaticTaskOptions() {
  console.log('🎨 Seeding static task options...');

  try {
    // Delete existing options
    const deleted = await prisma.staticTaskOption.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.count} existing options`);

    // Create new options
    for (const option of taskOptions) {
      await prisma.staticTaskOption.create({
        data: option,
      });
    }

    console.log(`✅ Created ${taskOptions.length} static task options`);

    // Show summary
    const priorities = taskOptions.filter((o) => o.optionType === 'PRIORITY');
    const statuses = taskOptions.filter((o) => o.optionType === 'STATUS');

    console.log(`\n📊 Summary:`);
    console.log(`  - Priorities: ${priorities.length}`);
    console.log(`  - Statuses: ${statuses.length}`);
    console.log(`\n🎯 Default options:`);
    console.log(`  - Priority: ${priorities.find((o) => o.isDefault)?.label || 'None'}`);
    console.log(`  - Status: ${statuses.find((o) => o.isDefault)?.label || 'None'}`);
  } catch (error) {
    console.error('❌ Error seeding static task options:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedStaticTaskOptions()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedStaticTaskOptions };
