# Schema Refactor Migration Instructions

## Overview
This migration implements the complete schema refactor with:
- ✅ Unified `Membership` model (replaces `TenantUser` + `ProjectMember`)
- ✅ Separate `Template` tables (master templates managed by super admins)
- ✅ Unified `StaticTaskOption` table (priority + status with shared IDs)
- ✅ New `SystemRole` enum (SUPER_ADMIN, TENANT_ADMIN, PROJECT_ADMIN, MEMBER, VIEWER)
- ✅ Enhanced invitation flow with membership-based redemption

---

## ⚠️ IMPORTANT: This Will Drop All Tables

**This migration rebuilds the entire database from scratch.**
- All existing data will be lost
- Safe for dummy data only
- Backup your database if needed

---

## Step 1: Ensure PostgreSQL is Running

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# If not running, start it
sudo systemctl start postgresql

# Or using Docker
docker-compose up -d postgres
```

---

## Step 2: Update Prisma Client

```bash
cd backend

# Generate Prisma Client for new schema
npx prisma generate
```

---

## Step 3: Run Migration

**Option A: Using Prisma CLI (Recommended)**

```bash
cd backend

# This will drop all tables and recreate with new schema
npx prisma migrate reset --force --skip-seed
```

**Option B: Manual SQL Execution**

```bash
cd backend

# Load DATABASE_URL from .env
source .env

# Run migration SQL directly
psql "$DATABASE_URL" -f prisma/migrations/20251110_complete_schema_refactor/migration.sql
```

---

## Step 4: Run Seed Scripts

```bash
cd backend

# Run all seeds (onboarding options, task options, templates)
node prisma/seed.js

# Or run individually:
node prisma/seeds/consolidatedOptions.seed.js
node prisma/seeds/staticTaskOptions.seed.js
node prisma/seeds/templates.seed.js
```

**Expected Output:**
```
🌱 Starting database seeding...

1/3 Onboarding Options
✅ Seeded onboarding options

2/3 Static Task Options
🎨 Seeding static task options...
✅ Created 10 static task options
📊 Summary:
  - Priorities: 4 (Critical, High, Medium, Low)
  - Statuses: 6 (To Do, In Progress, In Review, Blocked, Completed, Cancelled)

3/3 Global Templates
📋 Seeding global templates...
✅ System admin created: admin@tms.system
✅ Marketing Campaign (MARKETING)
✅ Software Development Sprint (IT)
✅ Sales Pipeline (SALES)
✅ Employee Onboarding (HR)
✅ Content Calendar (MARKETING)
✅ Product Launch (OPERATION)
✅ Event Planning (OPERATION)
✅ Bug Tracking (IT)
✅ Design Project (DESIGN)
✅ Customer Support (OPERATION)

🎉 Successfully created 10 global templates!

✨ Database seeding completed successfully!
```

---

## Step 5: Verify Migration

```bash
cd backend

# Check database schema
npx prisma db pull

# Verify tables exist
psql "$DATABASE_URL" -c "\dt"
```

**Expected Tables:**
```
 invitations
 memberships                 ← NEW (replaces tenant_users + project_members)
 onboarding_data
 onboarding_options
 otp_codes
 password_resets
 project_activities
 project_columns
 project_sections
 projects
 static_task_options         ← NEW (unified priority + status)
 subscription_plans
 task_comments
 tasks
 template_columns            ← NEW
 template_sections           ← NEW
 template_tasks              ← NEW
 templates                   ← NEW
 tenants
 users
```

---

## Step 6: Test Backend

```bash
cd backend

# Start backend server
npm run dev
```

**Test API:**
```bash
# Health check
curl http://localhost:5000/api/v1/health

# Expected: {"success": true, "message": "API is running"}

# List static task options
curl http://localhost:5000/api/v1/static-task-options

# List global templates (requires auth)
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:5000/api/v1/templates
```

---

## What Changed

### 1. Membership Model (Unified)

**Old:**
- `TenantUser` table (tenant-level access)
- `ProjectMember` table (project-level access)

**New:**
- `Membership` table with `level` enum:
  - `TENANT`: Access to ALL projects in tenant
  - `PROJECT`: Access to specific project only

**Example:**
```javascript
// Tenant-level membership (access all projects)
{
  userId: "user-id",
  tenantId: "tenant-id",
  projectId: null,
  level: "TENANT",
  role: "TENANT_ADMIN"
}

// Project-level membership (access only specific project)
{
  userId: "user-id",
  tenantId: "tenant-id",
  projectId: "project-id",
  level: "PROJECT",
  role: "MEMBER"
}
```

### 2. Template System (Separated)

**Old:**
- Templates stored in `projects` table with `isTemplate=true`

**New:**
- `templates` table (master templates)
- `template_sections` table
- `template_tasks` table (optional pre-defined tasks)
- `template_columns` table
- Projects reference templates via `templateId` FK

**Benefits:**
- Clean separation between templates and projects
- Better organization for super admin-managed templates
- Easier template management and cloning

### 3. Task Options (Unified)

**Old:**
- `task_status_options` table
- `task_priority_options` table

**New:**
- `static_task_options` table with `optionType` enum (PRIORITY | STATUS)
- Shared IDs across all tenants
- Tasks reference options by `value` (string) instead of ID

**Example:**
```javascript
// Priority option
{
  optionType: "PRIORITY",
  label: "High",
  value: "high",        // Referenced by Task.priority
  color: "#f59e0b"
}

// Status option
{
  optionType: "STATUS",
  label: "In Progress",
  value: "in_progress", // Referenced by Task.status
  color: "#3b82f6"
}
```

### 4. Roles (Unified)

**Old:**
- `TenantRole` enum (OWNER, ADMIN, MEMBER)
- `ProjectRole` enum (OWNER, ADMIN, MEMBER, VIEWER)
- `isSuperAdmin` boolean on User

**New:**
- `SystemRole` enum: SUPER_ADMIN, TENANT_ADMIN, PROJECT_ADMIN, MEMBER, VIEWER
- Single role field in `Membership` model
- Single `systemRole` field in `User` model (only for SUPER_ADMIN)

**Role Hierarchy:**
```
SUPER_ADMIN (5)       - Global system admin
├── TENANT_ADMIN (4)  - Manage tenant, users, settings
└── PROJECT_ADMIN (3) - Manage specific project
    └── MEMBER (2)    - Normal project member
        └── VIEWER (1) - Read-only access
```

### 5. Invitations (Simplified)

**Old:**
- `type` field (TENANT | PROJECT)
- `role` field (TenantRole)
- `projectRole` field (ProjectRole)

**New:**
- Single `role` field (SystemRole)
- `projectId` field (NULL = tenant-level, non-NULL = project-level)
- Creates `Membership` on acceptance with appropriate `level`

---

## Troubleshooting

### Issue: "relation does not exist"

**Cause:** Migration not applied

**Solution:**
```bash
npx prisma migrate reset --force
```

### Issue: "column does not exist"

**Cause:** Prisma client not regenerated

**Solution:**
```bash
npx prisma generate
```

### Issue: "Cannot find module '@prisma/client'"

**Cause:** Dependencies not installed

**Solution:**
```bash
npm install
```

### Issue: "No templates found"

**Cause:** Seeds not run

**Solution:**
```bash
node prisma/seed.js
```

---

## Rollback (If Needed)

If you need to rollback to the previous schema:

```bash
# Checkout previous commit
git checkout HEAD~1

# Reinstall dependencies
npm install

# Regenerate Prisma client
npx prisma generate

# Run old migrations
npx prisma migrate deploy
```

---

## Next Steps After Migration

1. ✅ **Update Backend Code:**
   - Create membership middleware (replacing tenantContext + checkProjectAccess)
   - Update invitation service for new flow
   - Create template controller and routes
   - Update existing controllers to use Membership model

2. ✅ **Update Frontend:**
   - Update invitation modal to show only: PROJECT_ADMIN, MEMBER, VIEWER
   - Update template browsing UI
   - Update member lists to use Membership API

3. ✅ **Test Everything:**
   - Invitation flow (tenant-level + project-level)
   - Template cloning
   - Project access control
   - Task creation with new option system

---

## Support

**Documentation:**
- [SCHEMA_REFACTOR_PLAN.md](./SCHEMA_REFACTOR_PLAN.md) - Complete architecture design
- [COMPREHENSIVE_ANALYSIS_REPORT.md](./COMPREHENSIVE_ANALYSIS_REPORT.md) - System analysis

**Files Changed:**
- `backend/prisma/schema.prisma` - Complete schema refactor
- `backend/prisma/migrations/20251110_complete_schema_refactor/migration.sql` - Migration SQL
- `backend/prisma/seeds/staticTaskOptions.seed.js` - Task options seed
- `backend/prisma/seeds/templates.seed.js` - Global templates seed
- `backend/prisma/seed.js` - Master seed script

---

**Migration Prepared By:** Claude (AI System Architect)
**Date:** November 10, 2025
**Status:** ✅ **Ready to Execute**
