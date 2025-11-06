# Database Migration Guide

## Overview of Changes

This migration consolidates multiple onboarding tables and adds dynamic status/priority options.

### Key Changes:

1. **Consolidated Onboarding Options**
   - Replaced 4 separate tables (`app_usage_options`, `industry_options`, `team_size_options`, `role_options`)
   - Single unified table: `onboarding_options` with a `category` field for grouping
   - Reduces table count and simplifies queries

2. **Dynamic Status & Priority Options**
   - Added `task_status_options` table for customizable task statuses
   - Added `task_priority_options` table for customizable task priorities
   - Project creation now fetches these from database instead of hardcoded values
   - Easy to add new options without code changes

3. **Multiple Subscription Plans**
   - Seeded with 4 plans: Free Trial, Starter, Professional, Enterprise
   - Each plan has different feature sets and pricing

4. **Onboarding Flow Enhancement**
   - After completing onboarding, users are now redirected to their first project
   - Previously redirected to dashboard

## Running the Migration

### Option 1: Using the setup script (Recommended)

```bash
cd backend
node scripts/setup-database.js
```

This will:
1. Run the migration SQL
2. Seed all onboarding options
3. Seed status and priority options
4. Seed subscription plans

### Option 2: Individual steps

**Step 1: Run migration**
```bash
node scripts/migrate.js
```

**Step 2: Seed data**
```bash
node prisma/seeds/consolidatedOptions.seed.js
```

## Rollback (if needed)

If you need to rollback, you'll need to:
1. Restore the old tables from backup
2. Update the schema to previous version
3. Update controllers to use old table names

**Note:** Always backup your database before running migrations!

## Testing

After migration, verify:

1. Onboarding options are accessible via API
2. Projects are created with dynamic status/priority options
3. Subscription plans are available
4. Onboarding completion redirects to first project

## API Changes

### Existing Endpoints (No Changes)
All existing onboarding option endpoints remain the same:
- `GET /api/v1/onboarding/options/app-usage`
- `GET /api/v1/onboarding/options/industries`
- `GET /api/v1/onboarding/options/team-sizes`
- `GET /api/v1/onboarding/options/roles`
- `GET /api/v1/onboarding/options/all`

### Backend Changes
Controllers now query the unified `onboarding_options` table with category filters.

### New Response Field
`POST /api/v1/onboarding/complete` now returns:
```json
{
  "data": {
    "tenant": {...},
    "project": {...},
    "invitationsSent": 0,
    "redirectTo": "/projects/{projectId}"  // NEW
  }
}
```

## Schema Changes Summary

### New Tables
- `onboarding_options` - Unified onboarding options with categories
- `task_status_options` - Dynamic task status options
- `task_priority_options` - Dynamic task priority options

### Removed Tables
- `app_usage_options`
- `industry_options`
- `team_size_options`
- `role_options`

### Modified Behavior
- `ProjectController.createProject()` now fetches status/priority from database
- `OnboardingController.completeOnboarding()` returns redirect path to first project
