const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Templates Seed Script
 * Creates 10 global templates accessible to all tenants
 * Must be created by a super admin user
 */

const templates = [
  {
    name: 'Marketing Campaign',
    description: 'Plan and execute marketing campaigns from concept to launch',
    color: '#ec4899',
    layout: 'BOARD',
    category: 'MARKETING',
    icon: 'Megaphone',
    sections: [
      { name: 'Planning', position: 0, color: '#3b82f6' },
      { name: 'Content Creation', position: 1, color: '#8b5cf6' },
      { name: 'Review', position: 2, color: '#f59e0b' },
      { name: 'Launch', position: 3, color: '#10b981' },
      { name: 'Analysis', position: 4, color: '#6366f1' },
    ],
    columns: [
      { name: 'Campaign Type', type: 'select', position: 0, options: { values: ['Social Media', 'Email', 'Content', 'Paid Ads'] } },
      { name: 'Budget', type: 'number', position: 1 },
      { name: 'Launch Date', type: 'date', position: 2 },
    ],
  },
  {
    name: 'Software Development Sprint',
    description: 'Agile sprint planning and execution for development teams',
    color: '#3b82f6',
    layout: 'BOARD',
    category: 'IT',
    icon: 'Code',
    sections: [
      { name: 'Backlog', position: 0, color: '#94a3b8' },
      { name: 'To Do', position: 1, color: '#3b82f6' },
      { name: 'In Progress', position: 2, color: '#f59e0b' },
      { name: 'Code Review', position: 3, color: '#8b5cf6' },
      { name: 'Testing', position: 4, color: '#ec4899' },
      { name: 'Done', position: 5, color: '#10b981' },
    ],
    columns: [
      { name: 'Story Points', type: 'number', position: 0 },
      { name: 'Sprint', type: 'select', position: 1, options: { values: ['Sprint 1', 'Sprint 2', 'Sprint 3'] } },
      { name: 'Type', type: 'select', position: 2, options: { values: ['Feature', 'Bug', 'Enhancement', 'Refactor'] } },
    ],
  },
  {
    name: 'Sales Pipeline',
    description: 'Track and manage sales opportunities from lead to close',
    color: '#10b981',
    layout: 'BOARD',
    category: 'SALES',
    icon: 'TrendingUp',
    sections: [
      { name: 'New Leads', position: 0, color: '#3b82f6' },
      { name: 'Qualified', position: 1, color: '#8b5cf6' },
      { name: 'Proposal', position: 2, color: '#f59e0b' },
      { name: 'Negotiation', position: 3, color: '#ec4899' },
      { name: 'Closed Won', position: 4, color: '#10b981' },
      { name: 'Closed Lost', position: 5, color: '#ef4444' },
    ],
    columns: [
      { name: 'Deal Value', type: 'number', position: 0 },
      { name: 'Lead Source', type: 'select', position: 1, options: { values: ['Website', 'Referral', 'Cold Call', 'Event'] } },
      { name: 'Expected Close Date', type: 'date', position: 2 },
      { name: 'Probability %', type: 'number', position: 3 },
    ],
  },
  {
    name: 'Employee Onboarding',
    description: 'Comprehensive new hire onboarding checklist and workflow',
    color: '#f59e0b',
    layout: 'LIST',
    category: 'HR',
    icon: 'Users',
    sections: [
      { name: 'Pre-Arrival', position: 0, color: '#3b82f6' },
      { name: 'Day 1', position: 1, color: '#10b981' },
      { name: 'Week 1', position: 2, color: '#8b5cf6' },
      { name: 'Month 1', position: 3, color: '#f59e0b' },
      { name: 'Month 3', position: 4, color: '#ec4899' },
    ],
    columns: [
      { name: 'Department', type: 'select', position: 0, options: { values: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'] } },
      { name: 'Mentor', type: 'user', position: 1 },
      { name: 'Completion %', type: 'number', position: 2 },
    ],
  },
  {
    name: 'Content Calendar',
    description: 'Plan, create, and publish content across multiple channels',
    color: '#8b5cf6',
    layout: 'CALENDAR',
    category: 'MARKETING',
    icon: 'Calendar',
    sections: [
      { name: 'Ideas', position: 0, color: '#3b82f6' },
      { name: 'In Progress', position: 1, color: '#f59e0b' },
      { name: 'Review', position: 2, color: '#ec4899' },
      { name: 'Scheduled', position: 3, color: '#8b5cf6' },
      { name: 'Published', position: 4, color: '#10b981' },
    ],
    columns: [
      { name: 'Content Type', type: 'select', position: 0, options: { values: ['Blog Post', 'Video', 'Infographic', 'Social Post'] } },
      { name: 'Platform', type: 'select', position: 1, options: { values: ['Blog', 'YouTube', 'LinkedIn', 'Twitter', 'Instagram'] } },
      { name: 'Publish Date', type: 'date', position: 2 },
    ],
  },
  {
    name: 'Product Launch',
    description: 'End-to-end product launch planning and execution',
    color: '#10b981',
    layout: 'LIST',
    category: 'OPERATION',
    icon: 'Rocket',
    sections: [
      { name: 'Research', position: 0, color: '#3b82f6' },
      { name: 'Development', position: 1, color: '#8b5cf6' },
      { name: 'Testing', position: 2, color: '#f59e0b' },
      { name: 'Marketing Prep', position: 3, color: '#ec4899' },
      { name: 'Launch', position: 4, color: '#10b981' },
      { name: 'Post-Launch', position: 5, color: '#6366f1' },
    ],
    columns: [
      { name: 'Phase', type: 'select', position: 0, options: { values: ['Alpha', 'Beta', 'MVP', 'v1.0'] } },
      { name: 'Risk Level', type: 'select', position: 1, options: { values: ['Low', 'Medium', 'High', 'Critical'] } },
    ],
  },
  {
    name: 'Event Planning',
    description: 'Organize and execute successful events from concept to completion',
    color: '#ec4899',
    layout: 'LIST',
    category: 'OPERATION',
    icon: 'Calendar',
    sections: [
      { name: 'Concept & Budget', position: 0, color: '#3b82f6' },
      { name: 'Venue & Vendors', position: 1, color: '#8b5cf6' },
      { name: 'Marketing', position: 2, color: '#ec4899' },
      { name: 'Logistics', position: 3, color: '#f59e0b' },
      { name: 'Event Day', position: 4, color: '#10b981' },
      { name: 'Follow-Up', position: 5, color: '#6366f1' },
    ],
    columns: [
      { name: 'Event Type', type: 'select', position: 0, options: { values: ['Conference', 'Webinar', 'Workshop', 'Networking'] } },
      { name: 'Expected Attendees', type: 'number', position: 1 },
      { name: 'Event Date', type: 'date', position: 2 },
    ],
  },
  {
    name: 'Bug Tracking',
    description: 'Track, prioritize, and resolve software bugs efficiently',
    color: '#ef4444',
    layout: 'LIST',
    category: 'IT',
    icon: 'Bug',
    sections: [
      { name: 'Reported', position: 0, color: '#ef4444' },
      { name: 'Triaged', position: 1, color: '#f59e0b' },
      { name: 'In Progress', position: 2, color: '#3b82f6' },
      { name: 'Fixed', position: 3, color: '#8b5cf6' },
      { name: 'Testing', position: 4, color: '#ec4899' },
      { name: 'Closed', position: 5, color: '#10b981' },
    ],
    columns: [
      { name: 'Severity', type: 'select', position: 0, options: { values: ['Critical', 'High', 'Medium', 'Low'] } },
      { name: 'Browser/OS', type: 'text', position: 1 },
      { name: 'Sprint', type: 'select', position: 2, options: { values: ['Current', 'Next', 'Backlog'] } },
    ],
  },
  {
    name: 'Design Project',
    description: 'Manage design projects from brief to final delivery',
    color: '#8b5cf6',
    layout: 'BOARD',
    category: 'DESIGN',
    icon: 'Palette',
    sections: [
      { name: 'Brief', position: 0, color: '#3b82f6' },
      { name: 'Research', position: 1, color: '#8b5cf6' },
      { name: 'Concept', position: 2, color: '#ec4899' },
      { name: 'Design', position: 3, color: '#f59e0b' },
      { name: 'Review', position: 4, color: '#6366f1' },
      { name: 'Delivered', position: 5, color: '#10b981' },
    ],
    columns: [
      { name: 'Design Type', type: 'select', position: 0, options: { values: ['Logo', 'Website', 'App UI', 'Marketing', 'Branding'] } },
      { name: 'Revisions', type: 'number', position: 1 },
      { name: 'Client', type: 'text', position: 2 },
    ],
  },
  {
    name: 'Customer Support',
    description: 'Manage and resolve customer support tickets efficiently',
    color: '#06b6d4',
    layout: 'LIST',
    category: 'OPERATION',
    icon: 'Headphones',
    sections: [
      { name: 'New', position: 0, color: '#3b82f6' },
      { name: 'In Progress', position: 1, color: '#f59e0b' },
      { name: 'Waiting on Customer', position: 2, color: '#8b5cf6' },
      { name: 'Escalated', position: 3, color: '#ef4444' },
      { name: 'Resolved', position: 4, color: '#10b981' },
    ],
    columns: [
      { name: 'Type', type: 'select', position: 0, options: { values: ['Bug', 'Feature Request', 'How-To', 'Billing'] } },
      { name: 'Priority', type: 'select', position: 1, options: { values: ['Low', 'Medium', 'High', 'Urgent'] } },
      { name: 'Response Time (hrs)', type: 'number', position: 2 },
    ],
  },
];

/**
 * Seed global templates
 */
async function seedTemplates() {
  console.log('📋 Seeding global templates...');

  try {
    // Find or create super admin
    let superAdmin = await prisma.user.findFirst({
      where: { systemRole: 'SUPER_ADMIN' },
    });

    if (!superAdmin) {
      console.log('⚠️  No super admin found. Creating system admin user...');
      superAdmin = await prisma.user.create({
        data: {
          email: 'admin@tms.system',
          authProvider: 'EMAIL',
          fullName: 'System Administrator',
          systemRole: 'SUPER_ADMIN',
          isEmailVerified: true,
        },
      });
      console.log('✅ System admin created:', superAdmin.email);
    } else {
      console.log('✅ Using existing super admin:', superAdmin.email);
    }

    // Delete existing global templates
    const deleted = await prisma.template.deleteMany({
      where: { isGlobal: true },
    });
    console.log(`🗑️  Deleted ${deleted.count} existing global templates`);

    // Create templates
    let createdCount = 0;
    for (const templateData of templates) {
      const template = await prisma.template.create({
        data: {
          name: templateData.name,
          description: templateData.description,
          color: templateData.color,
          layout: templateData.layout,
          category: templateData.category,
          icon: templateData.icon,
          isGlobal: true,
          createdBy: superAdmin.id,
          sections: {
            create: templateData.sections.map((section) => ({
              name: section.name,
              position: section.position,
              color: section.color,
            })),
          },
          columns: {
            create: templateData.columns.map((column) => ({
              name: column.name,
              type: column.type,
              position: column.position,
              options: column.options || null,
              width: 150,
              isDefault: false,
            })),
          },
        },
        include: {
          sections: true,
          columns: true,
        },
      });

      createdCount++;
      console.log(`  ✅ ${template.name} (${template.category})`);
    }

    console.log(`\n🎉 Successfully created ${createdCount} global templates!`);

    // Show summary by category
    const byCategory = templates.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {});

    console.log(`\n📊 Templates by category:`);
    Object.entries(byCategory).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count}`);
    });
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedTemplates()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedTemplates };
