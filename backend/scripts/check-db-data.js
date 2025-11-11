const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseData() {
  try {
    console.log('Checking database contents...\n');

    // Check onboarding options
    const onboardingOptions = await prisma.onboardingOption.count();
    console.log(`OnboardingOptions: ${onboardingOptions}`);

    // Check task status options
    const taskStatusOptions = await prisma.task_status_options.count();
    console.log(`TaskStatusOptions: ${taskStatusOptions}`);

    // Check task priority options
    const taskPriorityOptions = await prisma.task_priority_options.count();
    console.log(`TaskPriorityOptions: ${taskPriorityOptions}`);

    // Check subscription plans
    const subscriptionPlans = await prisma.subscriptionPlan.count();
    console.log(`SubscriptionPlans: ${subscriptionPlans}`);

    // Check templates
    const templates = await prisma.template.count();
    console.log(`Templates: ${templates}`);

    // Check template sections
    const templateSections = await prisma.templateSection.count();
    console.log(`TemplateSections: ${templateSections}`);

    // Check template tasks
    const templateTasks = await prisma.templateTask.count();
    console.log(`TemplateTasks: ${templateTasks}`);

    // Check projects (templates)
    const projects = await prisma.project.count();
    console.log(`Projects: ${projects}`);

    // Check tenants
    const tenants = await prisma.tenant.count();
    console.log(`Tenants: ${tenants}`);

    // Check users
    const users = await prisma.user.count();
    console.log(`Users: ${users}`);

    // Check project sections
    const sections = await prisma.projectSection.count();
    console.log(`ProjectSections: ${sections}`);

    // Check tasks
    const tasks = await prisma.task.count();
    console.log(`Tasks: ${tasks}`);

    console.log('\n✓ Database check complete!');
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseData();
