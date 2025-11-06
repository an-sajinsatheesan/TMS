const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedOnboardingOptions() {
  console.log('Seeding onboarding options...');

  // App Usage Options
  const appUsageOptions = [
    { label: 'Task & project management', value: 'task_project_management', position: 0 },
    { label: 'HR management', value: 'hr_management', position: 1 },
    { label: 'Marketing campaigns', value: 'marketing_campaigns', position: 2 },
    { label: 'Sales CRM & leads tracking', value: 'sales_crm_leads', position: 3 },
    { label: 'Product development / IT support', value: 'product_dev_it', position: 4 },
    { label: 'Operations / workflows', value: 'operations_workflows', position: 5 },
  ];

  for (const option of appUsageOptions) {
    await prisma.appUsageOption.upsert({
      where: { value: option.value },
      update: option,
      create: option,
    });
  }
  console.log(`✓ Seeded ${appUsageOptions.length} app usage options`);

  // Industry Options
  const industryOptions = [
    { label: 'IT / Software', value: 'it_software', position: 0 },
    { label: 'Healthcare', value: 'healthcare', position: 1 },
    { label: 'Education', value: 'education', position: 2 },
    { label: 'Manufacturing', value: 'manufacturing', position: 3 },
    { label: 'Retail / E-commerce', value: 'retail_ecommerce', position: 4 },
    { label: 'Marketing / Advertising', value: 'marketing_advertising', position: 5 },
    { label: 'Real Estate', value: 'real_estate', position: 6 },
    { label: 'Construction', value: 'construction', position: 7 },
  ];

  for (const option of industryOptions) {
    await prisma.industryOption.upsert({
      where: { value: option.value },
      update: option,
      create: option,
    });
  }
  console.log(`✓ Seeded ${industryOptions.length} industry options`);

  // Team Size Options
  const teamSizeOptions = [
    { label: 'Just me', value: 'just_me', minSize: 1, maxSize: 1, position: 0 },
    { label: '2-10', value: '2_10', minSize: 2, maxSize: 10, position: 1 },
    { label: '11-50', value: '11_50', minSize: 11, maxSize: 50, position: 2 },
    { label: '51-200', value: '51_200', minSize: 51, maxSize: 200, position: 3 },
    { label: '200+', value: '200_plus', minSize: 200, maxSize: null, position: 4 },
  ];

  for (const option of teamSizeOptions) {
    await prisma.teamSizeOption.upsert({
      where: { value: option.value },
      update: option,
      create: option,
    });
  }
  console.log(`✓ Seeded ${teamSizeOptions.length} team size options`);

  // Role Options
  const roleOptions = [
    { label: 'Business Owner / Founder', value: 'business_owner', icon: 'pi-briefcase', position: 0 },
    { label: 'Team Lead / Manager', value: 'team_lead', icon: 'pi-users', position: 1 },
    { label: 'Team Member / Employee', value: 'team_member', icon: 'pi-user', position: 2 },
    { label: 'HR / Recruiter', value: 'hr_recruiter', icon: 'pi-id-card', position: 3 },
    { label: 'Developer / Engineer', value: 'developer', icon: 'pi-code', position: 4 },
    { label: 'Designer / Creative', value: 'designer', icon: 'pi-palette', position: 5 },
    { label: 'Operations', value: 'operations', icon: 'pi-cog', position: 6 },
    { label: 'Other', value: 'other', icon: 'pi-ellipsis-h', position: 7 },
  ];

  for (const option of roleOptions) {
    await prisma.roleOption.upsert({
      where: { value: option.value },
      update: option,
      create: option,
    });
  }
  console.log(`✓ Seeded ${roleOptions.length} role options`);

  console.log('✓ Onboarding options seeded successfully!\n');
}

async function main() {
  try {
    await seedOnboardingOptions();
  } catch (error) {
    console.error('Error seeding onboarding options:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('Seed completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedOnboardingOptions };
