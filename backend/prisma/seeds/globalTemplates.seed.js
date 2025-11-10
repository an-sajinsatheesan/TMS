const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Global Templates Seed Script
 * Creates system-wide templates accessible to all tenants
 * Must be created by a super admin user
 */

const globalTemplates = [
  {
    name: 'Marketing Campaign',
    description: 'Complete marketing campaign management from planning to execution',
    color: '#ec4899',
    layout: 'BOARD',
    templateCategory: 'MARKETING',
    sections: [
      { name: 'Ideas & Planning', position: 0, color: '#3b82f6' },
      { name: 'Design & Content', position: 1, color: '#8b5cf6' },
      { name: 'Review & Approval', position: 2, color: '#f59e0b' },
      { name: 'Launch & Execute', position: 3, color: '#10b981' },
      { name: 'Analysis & Reporting', position: 4, color: '#6366f1' },
    ],
    columns: [
      { name: 'Campaign Type', type: 'select', position: 0, options: { values: ['Social Media', 'Email', 'Content', 'Paid Ads', 'Event'] } },
      { name: 'Budget', type: 'number', position: 1 },
      { name: 'Target Audience', type: 'text', position: 2 },
      { name: 'Launch Date', type: 'date', position: 3 },
    ],
  },
  {
    name: 'Product Launch',
    description: 'End-to-end product launch planning and execution workflow',
    color: '#10b981',
    layout: 'LIST',
    templateCategory: 'OPERATION',
    sections: [
      { name: 'Research & Validation', position: 0, color: '#3b82f6' },
      { name: 'Development', position: 1, color: '#8b5cf6' },
      { name: 'Testing & QA', position: 2, color: '#f59e0b' },
      { name: 'Marketing Prep', position: 3, color: '#ec4899' },
      { name: 'Launch', position: 4, color: '#10b981' },
      { name: 'Post-Launch', position: 5, color: '#6366f1' },
    ],
    columns: [
      { name: 'Product Feature', type: 'text', position: 0 },
      { name: 'Launch Phase', type: 'select', position: 1, options: { values: ['Alpha', 'Beta', 'MVP', 'v1.0', 'v2.0'] } },
      { name: 'Risk Level', type: 'select', position: 2, options: { values: ['Low', 'Medium', 'High', 'Critical'] } },
    ],
  },
  {
    name: 'Employee Onboarding',
    description: 'Comprehensive new employee onboarding checklist and workflow',
    color: '#f59e0b',
    layout: 'LIST',
    templateCategory: 'HR',
    sections: [
      { name: 'Pre-Arrival', position: 0, color: '#3b82f6' },
      { name: 'Day 1', position: 1, color: '#10b981' },
      { name: 'Week 1', position: 2, color: '#8b5cf6' },
      { name: 'Month 1', position: 3, color: '#f59e0b' },
      { name: 'Month 3', position: 4, color: '#ec4899' },
    ],
    columns: [
      { name: 'Department', type: 'select', position: 0, options: { values: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'] } },
      { name: 'Mentor Assigned', type: 'user', position: 1 },
      { name: 'Completion %', type: 'number', position: 2 },
    ],
  },
  {
    name: 'Software Development Sprint',
    description: 'Agile sprint planning and execution for development teams',
    color: '#3b82f6',
    layout: 'BOARD',
    templateCategory: 'IT',
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
      { name: 'Sprint', type: 'select', position: 1, options: { values: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'] } },
      { name: 'Epic', type: 'text', position: 2 },
      { name: 'Bug/Feature', type: 'select', position: 3, options: { values: ['Feature', 'Bug', 'Enhancement', 'Refactor'] } },
    ],
  },
  {
    name: 'Sales Pipeline',
    description: 'Track and manage sales opportunities from lead to close',
    color: '#10b981',
    layout: 'BOARD',
    templateCategory: 'SALES',
    sections: [
      { name: 'New Leads', position: 0, color: '#3b82f6' },
      { name: 'Qualified', position: 1, color: '#8b5cf6' },
      { name: 'Proposal Sent', position: 2, color: '#f59e0b' },
      { name: 'Negotiation', position: 3, color: '#ec4899' },
      { name: 'Closed Won', position: 4, color: '#10b981' },
      { name: 'Closed Lost', position: 5, color: '#ef4444' },
    ],
    columns: [
      { name: 'Deal Value', type: 'number', position: 0 },
      { name: 'Lead Source', type: 'select', position: 1, options: { values: ['Website', 'Referral', 'Cold Call', 'Event', 'Partner'] } },
      { name: 'Expected Close Date', type: 'date', position: 2 },
      { name: 'Probability %', type: 'number', position: 3 },
    ],
  },
  {
    name: 'Content Calendar',
    description: 'Plan, create, and publish content across multiple channels',
    color: '#8b5cf6',
    layout: 'CALENDAR',
    templateCategory: 'MARKETING',
    sections: [
      { name: 'Ideas', position: 0, color: '#3b82f6' },
      { name: 'In Progress', position: 1, color: '#f59e0b' },
      { name: 'Review', position: 2, color: '#ec4899' },
      { name: 'Scheduled', position: 3, color: '#8b5cf6' },
      { name: 'Published', position: 4, color: '#10b981' },
    ],
    columns: [
      { name: 'Content Type', type: 'select', position: 0, options: { values: ['Blog Post', 'Video', 'Infographic', 'Social Post', 'Newsletter'] } },
      { name: 'Platform', type: 'select', position: 1, options: { values: ['Blog', 'YouTube', 'LinkedIn', 'Twitter', 'Instagram', 'Email'] } },
      { name: 'Publish Date', type: 'date', position: 2 },
      { name: 'Writer', type: 'user', position: 3 },
    ],
  },
  {
    name: 'Event Planning',
    description: 'Organize and execute successful events from concept to completion',
    color: '#ec4899',
    layout: 'LIST',
    templateCategory: 'OPERATION',
    sections: [
      { name: 'Concept & Budget', position: 0, color: '#3b82f6' },
      { name: 'Venue & Vendors', position: 1, color: '#8b5cf6' },
      { name: 'Marketing & Promotion', position: 2, color: '#ec4899' },
      { name: 'Logistics', position: 3, color: '#f59e0b' },
      { name: 'Event Day', position: 4, color: '#10b981' },
      { name: 'Post-Event', position: 5, color: '#6366f1' },
    ],
    columns: [
      { name: 'Event Type', type: 'select', position: 0, options: { values: ['Conference', 'Webinar', 'Workshop', 'Networking', 'Launch Party'] } },
      { name: 'Expected Attendees', type: 'number', position: 1 },
      { name: 'Event Date', type: 'date', position: 2 },
      { name: 'Budget Allocated', type: 'number', position: 3 },
    ],
  },
  {
    name: 'Bug Tracking',
    description: 'Track, prioritize, and resolve software bugs efficiently',
    color: '#ef4444',
    layout: 'LIST',
    templateCategory: 'IT',
    sections: [
      { name: 'Reported', position: 0, color: '#ef4444' },
      { name: 'Triaged', position: 1, color: '#f59e0b' },
      { name: 'In Progress', position: 2, color: '#3b82f6' },
      { name: 'Code Review', position: 3, color: '#8b5cf6' },
      { name: 'Fixed - Testing', position: 4, color: '#ec4899' },
      { name: 'Verified & Closed', position: 5, color: '#10b981' },
    ],
    columns: [
      { name: 'Severity', type: 'select', position: 0, options: { values: ['Critical', 'High', 'Medium', 'Low'] } },
      { name: 'Browser/OS', type: 'text', position: 1 },
      { name: 'Reported By', type: 'user', position: 2 },
      { name: 'Sprint', type: 'select', position: 3, options: { values: ['Current', 'Next', 'Backlog'] } },
    ],
  },
  {
    name: 'Design Project',
    description: 'Manage design projects from brief to final delivery',
    color: '#8b5cf6',
    layout: 'BOARD',
    templateCategory: 'DESIGN',
    sections: [
      { name: 'Creative Brief', position: 0, color: '#3b82f6' },
      { name: 'Research & Inspiration', position: 1, color: '#8b5cf6' },
      { name: 'Concept Development', position: 2, color: '#ec4899' },
      { name: 'Design Execution', position: 3, color: '#f59e0b' },
      { name: 'Client Review', position: 4, color: '#6366f1' },
      { name: 'Final Delivery', position: 5, color: '#10b981' },
    ],
    columns: [
      { name: 'Design Type', type: 'select', position: 0, options: { values: ['Logo', 'Website', 'App UI', 'Marketing Material', 'Branding'] } },
      { name: 'Designer', type: 'user', position: 1 },
      { name: 'Revisions Remaining', type: 'number', position: 2 },
      { name: 'Client Name', type: 'text', position: 3 },
    ],
  },
  {
    name: 'Customer Support Tickets',
    description: 'Manage and resolve customer support inquiries efficiently',
    color: '#06b6d4',
    layout: 'LIST',
    templateCategory: 'OPERATION',
    sections: [
      { name: 'New Tickets', position: 0, color: '#3b82f6' },
      { name: 'In Progress', position: 1, color: '#f59e0b' },
      { name: 'Waiting on Customer', position: 2, color: '#8b5cf6' },
      { name: 'Escalated', position: 3, color: '#ef4444' },
      { name: 'Resolved', position: 4, color: '#10b981' },
    ],
    columns: [
      { name: 'Ticket Type', type: 'select', position: 0, options: { values: ['Bug Report', 'Feature Request', 'How-To', 'Billing', 'Other'] } },
      { name: 'Priority', type: 'select', position: 1, options: { values: ['Low', 'Medium', 'High', 'Urgent'] } },
      { name: 'Customer Name', type: 'text', position: 2 },
      { name: 'Response Time (hrs)', type: 'number', position: 3 },
    ],
  },
];

/**
 * Seed global templates
 * Creates templates accessible to all tenants
 */
async function seedGlobalTemplates() {
  console.log('🌍 Seeding global templates...');

  try {
    // Find or create a super admin user for template creation
    let superAdmin = await prisma.user.findFirst({
      where: { isSuperAdmin: true },
    });

    if (!superAdmin) {
      console.log('⚠️  No super admin found. Creating system admin user...');
      superAdmin = await prisma.user.create({
        data: {
          email: 'admin@taskmanagement.system',
          authProvider: 'EMAIL',
          fullName: 'System Administrator',
          isSuperAdmin: true,
          isEmailVerified: true,
        },
      });
      console.log('✅ System admin created:', superAdmin.email);
    }

    // Delete existing global templates to avoid duplicates
    const deleted = await prisma.project.deleteMany({
      where: { isGlobal: true, isTemplate: true },
    });
    console.log(`🗑️  Deleted ${deleted.count} existing global templates`);

    // Create global templates
    for (const templateData of globalTemplates) {
      const template = await prisma.project.create({
        data: {
          name: templateData.name,
          description: templateData.description,
          color: templateData.color,
          layout: templateData.layout,
          templateCategory: templateData.templateCategory,
          isTemplate: true,
          isGlobal: true,
          tenantId: null, // Global templates have no tenant
          createdBy: superAdmin.id,
          sections: {
            create: templateData.sections.map((section) => ({
              name: section.name,
              position: section.position,
              color: section.color,
            })),
          },
          columns: templateData.columns
            ? {
                create: templateData.columns.map((column) => ({
                  name: column.name,
                  type: column.type,
                  position: column.position,
                  options: column.options || null,
                  width: 150,
                  visible: true,
                  isDefault: false,
                })),
              }
            : undefined,
        },
        include: {
          sections: true,
          columns: true,
        },
      });

      console.log(`  ✅ Created: ${template.name} (${template.templateCategory})`);
    }

    console.log(`\n🎉 Successfully seeded ${globalTemplates.length} global templates!`);
    console.log(`\n📊 Templates by category:`);
    const byCategory = globalTemplates.reduce((acc, t) => {
      acc[t.templateCategory] = (acc[t.templateCategory] || 0) + 1;
      return acc;
    }, {});
    Object.entries(byCategory).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count}`);
    });
  } catch (error) {
    console.error('❌ Error seeding global templates:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedGlobalTemplates()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedGlobalTemplates };
