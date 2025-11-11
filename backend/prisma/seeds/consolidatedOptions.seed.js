const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedConsolidatedOptions() {
  console.log('Seeding consolidated onboarding options...');

  // App Usage Options
  const appUsageOptions = [
    { category: 'app_usage', label: 'Task & project management', value: 'task_project_management', position: 0 },
    { category: 'app_usage', label: 'HR management', value: 'hr_management', position: 1 },
    { category: 'app_usage', label: 'Marketing campaigns', value: 'marketing_campaigns', position: 2 },
    { category: 'app_usage', label: 'Sales CRM & leads tracking', value: 'sales_crm_leads', position: 3 },
    { category: 'app_usage', label: 'Product development / IT support', value: 'product_dev_it', position: 4 },
    { category: 'app_usage', label: 'Operations / workflows', value: 'operations_workflows', position: 5 },
  ];

  // Industry Options
  const industryOptions = [
    { category: 'industry', label: 'IT / Software', value: 'it_software', position: 0 },
    { category: 'industry', label: 'Healthcare', value: 'healthcare', position: 1 },
    { category: 'industry', label: 'Education', value: 'education', position: 2 },
    { category: 'industry', label: 'Manufacturing', value: 'manufacturing', position: 3 },
    { category: 'industry', label: 'Retail / E-commerce', value: 'retail_ecommerce', position: 4 },
    { category: 'industry', label: 'Marketing / Advertising', value: 'marketing_advertising', position: 5 },
    { category: 'industry', label: 'Real Estate', value: 'real_estate', position: 6 },
    { category: 'industry', label: 'Construction', value: 'construction', position: 7 },
  ];

  // Team Size Options
  const teamSizeOptions = [
    { category: 'team_size', label: 'Just me', value: 'just_me', minSize: 1, maxSize: 1, position: 0 },
    { category: 'team_size', label: '2-10', value: '2_10', minSize: 2, maxSize: 10, position: 1 },
    { category: 'team_size', label: '11-50', value: '11_50', minSize: 11, maxSize: 50, position: 2 },
    { category: 'team_size', label: '51-200', value: '51_200', minSize: 51, maxSize: 200, position: 3 },
    { category: 'team_size', label: '200+', value: '200_plus', minSize: 200, maxSize: null, position: 4 },
  ];

  // Role Options
  const roleOptions = [
    { category: 'role', label: 'Business Owner / Founder', value: 'business_owner', icon: 'pi-briefcase', position: 0 },
    { category: 'role', label: 'Team Lead / Manager', value: 'team_lead', icon: 'pi-users', position: 1 },
    { category: 'role', label: 'Team Member / Employee', value: 'team_member', icon: 'pi-user', position: 2 },
    { category: 'role', label: 'HR / Recruiter', value: 'hr_recruiter', icon: 'pi-id-card', position: 3 },
    { category: 'role', label: 'Developer / Engineer', value: 'developer', icon: 'pi-code', position: 4 },
    { category: 'role', label: 'Designer / Creative', value: 'designer', icon: 'pi-palette', position: 5 },
    { category: 'role', label: 'Operations', value: 'operations', icon: 'pi-cog', position: 6 },
    { category: 'role', label: 'Other', value: 'other', icon: 'pi-ellipsis-h', position: 7 },
  ];

  // Combine all options
  const allOptions = [...appUsageOptions, ...industryOptions, ...teamSizeOptions, ...roleOptions];

  for (const option of allOptions) {
    await prisma.onboardingOption.upsert({
      where: {
        category_value: {
          category: option.category,
          value: option.value
        }
      },
      update: option,
      create: option,
    });
  }
  console.log(`✓ Seeded ${allOptions.length} onboarding options`);
}

async function seedTaskStatusOptions() {
  console.log('Seeding task status options...');

  const { v4: uuidv4 } = require('uuid');
  const now = new Date();

  const statusOptions = [
    { id: uuidv4(), label: 'On Track', value: 'On Track', color: '#10b981', icon: 'pi-check-circle', position: 0, createdAt: now, updatedAt: now },
    { id: uuidv4(), label: 'At Risk', value: 'At Risk', color: '#f59e0b', icon: 'pi-exclamation-triangle', position: 1, createdAt: now, updatedAt: now },
    { id: uuidv4(), label: 'Off Track', value: 'Off Track', color: '#ef4444', icon: 'pi-times-circle', position: 2, createdAt: now, updatedAt: now },
    { id: uuidv4(), label: 'Completed', value: 'Completed', color: '#8b5cf6', icon: 'pi-check', position: 3, createdAt: now, updatedAt: now },
    { id: uuidv4(), label: 'On Hold', value: 'On Hold', color: '#6b7280', icon: 'pi-pause-circle', position: 4, createdAt: now, updatedAt: now },
  ];

  for (const option of statusOptions) {
    await prisma.task_status_options.upsert({
      where: { value: option.value },
      update: option,
      create: option,
    });
  }
  console.log(`✓ Seeded ${statusOptions.length} task status options`);
}

async function seedTaskPriorityOptions() {
  console.log('Seeding task priority options...');

  const { v4: uuidv4 } = require('uuid');
  const now = new Date();

  const priorityOptions = [
    { id: uuidv4(), label: 'High', value: 'High', color: '#ef4444', icon: 'pi-angle-double-up', position: 0, createdAt: now, updatedAt: now },
    { id: uuidv4(), label: 'Medium', value: 'Medium', color: '#f59e0b', icon: 'pi-minus', position: 1, createdAt: now, updatedAt: now },
    { id: uuidv4(), label: 'Low', value: 'Low', color: '#3b82f6', icon: 'pi-angle-double-down', position: 2, createdAt: now, updatedAt: now },
  ];

  for (const option of priorityOptions) {
    await prisma.task_priority_options.upsert({
      where: { value: option.value },
      update: option,
      create: option,
    });
  }
  console.log(`✓ Seeded ${priorityOptions.length} task priority options`);
}

async function seedSubscriptionPlans() {
  console.log('Seeding subscription plans...');

  const plans = [
    {
      name: 'Free Trial',
      features: {
        maxUsers: 5,
        maxProjects: 10,
        storage: '1GB',
        customFields: false,
        advancedReporting: false,
        apiAccess: false,
        priority_support: false,
      },
      price: 0,
      trialDays: 14,
    },
    {
      name: 'Starter',
      features: {
        maxUsers: 10,
        maxProjects: 25,
        storage: '10GB',
        customFields: true,
        advancedReporting: false,
        apiAccess: false,
        priority_support: false,
      },
      price: 9.99,
      trialDays: 14,
    },
    {
      name: 'Professional',
      features: {
        maxUsers: 50,
        maxProjects: 100,
        storage: '100GB',
        customFields: true,
        advancedReporting: true,
        apiAccess: true,
        priority_support: false,
      },
      price: 29.99,
      trialDays: 14,
    },
    {
      name: 'Enterprise',
      features: {
        maxUsers: -1, // unlimited
        maxProjects: -1, // unlimited
        storage: 'Unlimited',
        customFields: true,
        advancedReporting: true,
        apiAccess: true,
        priority_support: true,
        customIntegrations: true,
        dedicatedSupport: true,
      },
      price: 99.99,
      trialDays: 30,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }
  console.log(`✓ Seeded ${plans.length} subscription plans`);
}

async function seedProjectTemplates() {
  console.log('Seeding project templates...');

  const templates = [
    // Marketing Templates
    {
      name: 'Marketing Campaign Launch',
      description: 'Template for planning and executing marketing campaigns',
      category: 'MARKETING',
      isGlobal: true,
      color: '#ef4444',
      layout: 'LIST',
      sections: [
        { name: 'Planning', color: '#3b82f6', position: 0 },
        { name: 'Content Creation', color: '#10b981', position: 1 },
        { name: 'Review & Approval', color: '#f59e0b', position: 2 },
        { name: 'Launch', color: '#8b5cf6', position: 3 },
      ],
      tasks: [
        { title: 'Define campaign goals and KPIs', sectionIndex: 0, position: 0 },
        { title: 'Identify target audience', sectionIndex: 0, position: 1 },
        { title: 'Create content calendar', sectionIndex: 1, position: 0 },
        { title: 'Design creatives', sectionIndex: 1, position: 1 },
        { title: 'Write copy', sectionIndex: 1, position: 2 },
        { title: 'Internal review', sectionIndex: 2, position: 0 },
        { title: 'Stakeholder approval', sectionIndex: 2, position: 1 },
        { title: 'Schedule posts', sectionIndex: 3, position: 0 },
        { title: 'Monitor performance', sectionIndex: 3, position: 1 },
      ]
    },
    {
      name: 'Social Media Management',
      description: 'Organize and track social media content across platforms',
      category: 'MARKETING',
      isGlobal: true,
      color: '#ec4899',
      layout: 'BOARD',
      sections: [
        { name: 'Ideas', color: '#f59e0b', position: 0 },
        { name: 'In Progress', color: '#3b82f6', position: 1 },
        { name: 'Scheduled', color: '#8b5cf6', position: 2 },
        { name: 'Published', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Product announcement post', sectionIndex: 0, position: 0 },
        { title: 'Customer testimonial video', sectionIndex: 0, position: 1 },
        { title: 'Behind-the-scenes content', sectionIndex: 1, position: 0 },
      ]
    },
    {
      name: 'Content Marketing Pipeline',
      description: 'Manage blog posts, videos, and other content creation',
      category: 'MARKETING',
      isGlobal: true,
      color: '#f59e0b',
      layout: 'LIST',
      sections: [
        { name: 'Research & Ideation', color: '#6366f1', position: 0 },
        { name: 'Drafting', color: '#3b82f6', position: 1 },
        { name: 'Editing', color: '#f59e0b', position: 2 },
        { name: 'Published', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Research trending topics', sectionIndex: 0, position: 0 },
        { title: 'Keyword analysis', sectionIndex: 0, position: 1 },
        { title: 'Create outline', sectionIndex: 1, position: 0 },
      ]
    },

    // HR Templates
    {
      name: 'Employee Onboarding',
      description: 'Streamline new hire onboarding process',
      category: 'HR',
      isGlobal: true,
      color: '#06b6d4',
      layout: 'LIST',
      sections: [
        { name: 'Pre-boarding', color: '#3b82f6', position: 0 },
        { name: 'First Day', color: '#10b981', position: 1 },
        { name: 'First Week', color: '#f59e0b', position: 2 },
        { name: 'First Month', color: '#8b5cf6', position: 3 },
      ],
      tasks: [
        { title: 'Send welcome email', sectionIndex: 0, position: 0 },
        { title: 'Setup workstation', sectionIndex: 0, position: 1 },
        { title: 'Create email account', sectionIndex: 0, position: 2 },
        { title: 'Office tour', sectionIndex: 1, position: 0 },
        { title: 'Team introductions', sectionIndex: 1, position: 1 },
        { title: 'Product training', sectionIndex: 2, position: 0 },
        { title: '30-day check-in', sectionIndex: 3, position: 0 },
      ]
    },
    {
      name: 'Recruitment Pipeline',
      description: 'Track candidates through the hiring process',
      category: 'HR',
      isGlobal: true,
      color: '#14b8a6',
      layout: 'BOARD',
      sections: [
        { name: 'Applied', color: '#94a3b8', position: 0 },
        { name: 'Screening', color: '#3b82f6', position: 1 },
        { name: 'Interview', color: '#f59e0b', position: 2 },
        { name: 'Offer', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Review applications', sectionIndex: 0, position: 0 },
        { title: 'Phone screening', sectionIndex: 1, position: 0 },
        { title: 'Technical interview', sectionIndex: 2, position: 0 },
      ]
    },
    {
      name: 'Performance Review Cycle',
      description: 'Manage quarterly or annual performance reviews',
      category: 'HR',
      isGlobal: true,
      color: '#0ea5e9',
      layout: 'LIST',
      sections: [
        { name: 'Preparation', color: '#3b82f6', position: 0 },
        { name: 'Self-Assessment', color: '#8b5cf6', position: 1 },
        { name: 'Manager Review', color: '#f59e0b', position: 2 },
        { name: 'Completed', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Send review templates', sectionIndex: 0, position: 0 },
        { title: 'Collect peer feedback', sectionIndex: 0, position: 1 },
        { title: 'Employee self-assessment', sectionIndex: 1, position: 0 },
      ]
    },

    // IT Templates
    {
      name: 'Software Development Sprint',
      description: 'Agile sprint planning and execution',
      category: 'IT',
      isGlobal: true,
      color: '#8b5cf6',
      layout: 'BOARD',
      sections: [
        { name: 'Backlog', color: '#94a3b8', position: 0 },
        { name: 'To Do', color: '#3b82f6', position: 1 },
        { name: 'In Progress', color: '#f59e0b', position: 2 },
        { name: 'Done', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Sprint planning meeting', sectionIndex: 1, position: 0 },
        { title: 'User story refinement', sectionIndex: 0, position: 0 },
        { title: 'Code review', sectionIndex: 2, position: 0 },
      ]
    },
    {
      name: 'Bug Tracking & Resolution',
      description: 'Track and resolve software bugs',
      category: 'IT',
      isGlobal: true,
      color: '#ef4444',
      layout: 'LIST',
      sections: [
        { name: 'Reported', color: '#ef4444', position: 0 },
        { name: 'Triaged', color: '#f59e0b', position: 1 },
        { name: 'In Progress', color: '#3b82f6', position: 2 },
        { name: 'Resolved', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Reproduce bug', sectionIndex: 1, position: 0 },
        { title: 'Assign priority', sectionIndex: 1, position: 1 },
        { title: 'Fix and test', sectionIndex: 2, position: 0 },
      ]
    },
    {
      name: 'IT Infrastructure Setup',
      description: 'Setup and configure IT infrastructure for new projects',
      category: 'IT',
      isGlobal: true,
      color: '#6366f1',
      layout: 'LIST',
      sections: [
        { name: 'Planning', color: '#3b82f6', position: 0 },
        { name: 'Setup', color: '#f59e0b', position: 1 },
        { name: 'Configuration', color: '#8b5cf6', position: 2 },
        { name: 'Testing', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Define requirements', sectionIndex: 0, position: 0 },
        { title: 'Provision servers', sectionIndex: 1, position: 0 },
        { title: 'Configure networking', sectionIndex: 2, position: 0 },
      ]
    },

    // Sales Templates
    {
      name: 'Sales Pipeline',
      description: 'Track leads through the sales funnel',
      category: 'SALES',
      isGlobal: true,
      color: '#10b981',
      layout: 'BOARD',
      sections: [
        { name: 'Lead', color: '#94a3b8', position: 0 },
        { name: 'Qualified', color: '#3b82f6', position: 1 },
        { name: 'Proposal', color: '#f59e0b', position: 2 },
        { name: 'Closed', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Initial contact', sectionIndex: 0, position: 0 },
        { title: 'Discovery call', sectionIndex: 1, position: 0 },
        { title: 'Send proposal', sectionIndex: 2, position: 0 },
      ]
    },
    {
      name: 'Product Launch Sales Plan',
      description: 'Coordinate sales activities for new product launches',
      category: 'SALES',
      isGlobal: true,
      color: '#22c55e',
      layout: 'LIST',
      sections: [
        { name: 'Pre-Launch', color: '#3b82f6', position: 0 },
        { name: 'Launch Week', color: '#f59e0b', position: 1 },
        { name: 'Follow-up', color: '#8b5cf6', position: 2 },
        { name: 'Closed Deals', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Prepare sales materials', sectionIndex: 0, position: 0 },
        { title: 'Train sales team', sectionIndex: 0, position: 1 },
        { title: 'Reach out to prospects', sectionIndex: 1, position: 0 },
      ]
    },
    {
      name: 'Account Management',
      description: 'Manage and grow existing customer accounts',
      category: 'SALES',
      isGlobal: true,
      color: '#059669',
      layout: 'LIST',
      sections: [
        { name: 'Onboarding', color: '#3b82f6', position: 0 },
        { name: 'Regular Check-ins', color: '#8b5cf6', position: 1 },
        { name: 'Upsell Opportunities', color: '#f59e0b', position: 2 },
        { name: 'Renewal', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Welcome call', sectionIndex: 0, position: 0 },
        { title: 'Quarterly business review', sectionIndex: 1, position: 0 },
        { title: 'Identify expansion opportunities', sectionIndex: 2, position: 0 },
      ]
    },

    // Operations Templates
    {
      name: 'Process Improvement Initiative',
      description: 'Plan and implement operational improvements',
      category: 'OPERATION',
      isGlobal: true,
      color: '#f97316',
      layout: 'LIST',
      sections: [
        { name: 'Analysis', color: '#3b82f6', position: 0 },
        { name: 'Planning', color: '#8b5cf6', position: 1 },
        { name: 'Implementation', color: '#f59e0b', position: 2 },
        { name: 'Review', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Identify bottlenecks', sectionIndex: 0, position: 0 },
        { title: 'Map current process', sectionIndex: 0, position: 1 },
        { title: 'Design new workflow', sectionIndex: 1, position: 0 },
      ]
    },
    {
      name: 'Vendor Management',
      description: 'Track vendor relationships and contracts',
      category: 'OPERATION',
      isGlobal: true,
      color: '#ea580c',
      layout: 'LIST',
      sections: [
        { name: 'Evaluation', color: '#3b82f6', position: 0 },
        { name: 'Contracting', color: '#f59e0b', position: 1 },
        { name: 'Active', color: '#10b981', position: 2 },
        { name: 'Renewal/Termination', color: '#8b5cf6', position: 3 },
      ],
      tasks: [
        { title: 'RFP preparation', sectionIndex: 0, position: 0 },
        { title: 'Vendor comparison', sectionIndex: 0, position: 1 },
        { title: 'Contract negotiation', sectionIndex: 1, position: 0 },
      ]
    },
    {
      name: 'Inventory Management',
      description: 'Track and manage inventory levels',
      category: 'OPERATION',
      isGlobal: true,
      color: '#fb923c',
      layout: 'LIST',
      sections: [
        { name: 'Stock Check', color: '#3b82f6', position: 0 },
        { name: 'Reorder', color: '#f59e0b', position: 1 },
        { name: 'Receiving', color: '#8b5cf6', position: 2 },
        { name: 'Stocked', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Weekly inventory audit', sectionIndex: 0, position: 0 },
        { title: 'Check reorder points', sectionIndex: 0, position: 1 },
        { title: 'Create purchase order', sectionIndex: 1, position: 0 },
      ]
    },

    // Campaign Templates
    {
      name: 'Email Marketing Campaign',
      description: 'Plan and execute email marketing campaigns',
      category: 'CAMPAIGN',
      isGlobal: true,
      color: '#ec4899',
      layout: 'LIST',
      sections: [
        { name: 'Planning', color: '#3b82f6', position: 0 },
        { name: 'Design', color: '#8b5cf6', position: 1 },
        { name: 'Testing', color: '#f59e0b', position: 2 },
        { name: 'Sent', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Define campaign goals', sectionIndex: 0, position: 0 },
        { title: 'Segment audience', sectionIndex: 0, position: 1 },
        { title: 'Write email copy', sectionIndex: 1, position: 0 },
        { title: 'Design template', sectionIndex: 1, position: 1 },
        { title: 'A/B test subject lines', sectionIndex: 2, position: 0 },
      ]
    },
    {
      name: 'Event Planning & Execution',
      description: 'Organize corporate events and conferences',
      category: 'CAMPAIGN',
      isGlobal: true,
      color: '#d946ef',
      layout: 'LIST',
      sections: [
        { name: 'Planning', color: '#3b82f6', position: 0 },
        { name: 'Promotion', color: '#f59e0b', position: 1 },
        { name: 'Execution', color: '#8b5cf6', position: 2 },
        { name: 'Follow-up', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Book venue', sectionIndex: 0, position: 0 },
        { title: 'Arrange catering', sectionIndex: 0, position: 1 },
        { title: 'Send invitations', sectionIndex: 1, position: 0 },
        { title: 'Event day coordination', sectionIndex: 2, position: 0 },
      ]
    },
    {
      name: 'PR Campaign',
      description: 'Manage public relations and media outreach campaigns',
      category: 'CAMPAIGN',
      isGlobal: true,
      color: '#c026d3',
      layout: 'LIST',
      sections: [
        { name: 'Strategy', color: '#3b82f6', position: 0 },
        { name: 'Outreach', color: '#f59e0b', position: 1 },
        { name: 'Coverage', color: '#8b5cf6', position: 2 },
        { name: 'Analysis', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Create press release', sectionIndex: 0, position: 0 },
        { title: 'Build media list', sectionIndex: 0, position: 1 },
        { title: 'Pitch to journalists', sectionIndex: 1, position: 0 },
      ]
    },

    // Design Templates
    {
      name: 'Website Redesign',
      description: 'Plan and execute website redesign projects',
      category: 'DESIGN',
      isGlobal: true,
      color: '#a855f7',
      layout: 'LIST',
      sections: [
        { name: 'Discovery', color: '#3b82f6', position: 0 },
        { name: 'Design', color: '#8b5cf6', position: 1 },
        { name: 'Development', color: '#f59e0b', position: 2 },
        { name: 'Launch', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'User research', sectionIndex: 0, position: 0 },
        { title: 'Create wireframes', sectionIndex: 1, position: 0 },
        { title: 'Design mockups', sectionIndex: 1, position: 1 },
        { title: 'Frontend development', sectionIndex: 2, position: 0 },
      ]
    },
    {
      name: 'Brand Identity Development',
      description: 'Create comprehensive brand identity systems',
      category: 'DESIGN',
      isGlobal: true,
      color: '#9333ea',
      layout: 'LIST',
      sections: [
        { name: 'Research', color: '#3b82f6', position: 0 },
        { name: 'Concepts', color: '#8b5cf6', position: 1 },
        { name: 'Refinement', color: '#f59e0b', position: 2 },
        { name: 'Delivery', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Competitive analysis', sectionIndex: 0, position: 0 },
        { title: 'Logo concepts', sectionIndex: 1, position: 0 },
        { title: 'Color palette development', sectionIndex: 1, position: 1 },
        { title: 'Brand guidelines document', sectionIndex: 3, position: 0 },
      ]
    },
    {
      name: 'UI/UX Design Sprint',
      description: 'Rapid design and prototyping for new features',
      category: 'DESIGN',
      isGlobal: true,
      color: '#7c3aed',
      layout: 'LIST',
      sections: [
        { name: 'Understand', color: '#3b82f6', position: 0 },
        { name: 'Sketch', color: '#8b5cf6', position: 1 },
        { name: 'Prototype', color: '#f59e0b', position: 2 },
        { name: 'Test', color: '#10b981', position: 3 },
      ],
      tasks: [
        { title: 'Define problem statement', sectionIndex: 0, position: 0 },
        { title: 'User flow mapping', sectionIndex: 0, position: 1 },
        { title: 'Low-fi wireframes', sectionIndex: 1, position: 0 },
        { title: 'Interactive prototype', sectionIndex: 2, position: 0 },
      ]
    },
  ];

  // Create system user for templates if it doesn't exist
  let systemUser = await prisma.user.findFirst({
    where: { email: 'system@templates.local' }
  });

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'system@templates.local',
        fullName: 'System Templates',
        isEmailVerified: true,
        authProvider: 'EMAIL',
        isSuperAdmin: true,
      }
    });
  }

  let createdCount = 0;

  for (const template of templates) {
    // Check if template already exists
    const existing = await prisma.template.findFirst({
      where: {
        name: template.name,
        isGlobal: true
      }
    });

    if (existing) {
      continue; // Skip if already exists
    }

    // Create the template with sections and tasks
    const { sections, tasks, ...templateData } = template;

    const createdTemplate = await prisma.template.create({
      data: {
        ...templateData,
        createdBy: systemUser.id,
      }
    });

    // Create sections
    const createdSections = [];
    for (const section of sections) {
      const createdSection = await prisma.templateSection.create({
        data: {
          ...section,
          templateId: createdTemplate.id,
        }
      });
      createdSections.push(createdSection);
    }

    // Create tasks
    for (const task of tasks) {
      const { sectionIndex, position, ...taskData } = task;
      await prisma.templateTask.create({
        data: {
          ...taskData,
          sectionId: createdSections[sectionIndex].id,
          position: position,
        }
      });
    }

    createdCount++;
  }

  console.log(`✓ Seeded ${createdCount} global templates`);
}

async function main() {
  try {
    await seedConsolidatedOptions();
    await seedTaskStatusOptions();
    await seedTaskPriorityOptions();
    await seedSubscriptionPlans();
    await seedProjectTemplates();
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✓ All seeds completed successfully!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  seedConsolidatedOptions,
  seedTaskStatusOptions,
  seedTaskPriorityOptions,
  seedSubscriptionPlans,
  seedProjectTemplates
};
