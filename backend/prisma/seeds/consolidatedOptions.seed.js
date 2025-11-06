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

  const statusOptions = [
    { label: 'On Track', value: 'On Track', color: '#10b981', icon: 'pi-check-circle', position: 0 },
    { label: 'At Risk', value: 'At Risk', color: '#f59e0b', icon: 'pi-exclamation-triangle', position: 1 },
    { label: 'Off Track', value: 'Off Track', color: '#ef4444', icon: 'pi-times-circle', position: 2 },
    { label: 'Completed', value: 'Completed', color: '#8b5cf6', icon: 'pi-check', position: 3 },
    { label: 'On Hold', value: 'On Hold', color: '#6b7280', icon: 'pi-pause-circle', position: 4 },
  ];

  for (const option of statusOptions) {
    await prisma.taskStatusOption.upsert({
      where: { value: option.value },
      update: option,
      create: option,
    });
  }
  console.log(`✓ Seeded ${statusOptions.length} task status options`);
}

async function seedTaskPriorityOptions() {
  console.log('Seeding task priority options...');

  const priorityOptions = [
    { label: 'High', value: 'High', color: '#ef4444', icon: 'pi-angle-double-up', position: 0 },
    { label: 'Medium', value: 'Medium', color: '#f59e0b', icon: 'pi-minus', position: 1 },
    { label: 'Low', value: 'Low', color: '#3b82f6', icon: 'pi-angle-double-down', position: 2 },
  ];

  for (const option of priorityOptions) {
    await prisma.taskPriorityOption.upsert({
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

async function main() {
  try {
    await seedConsolidatedOptions();
    await seedTaskStatusOptions();
    await seedTaskPriorityOptions();
    await seedSubscriptionPlans();
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
  seedSubscriptionPlans
};
