-- Complete Schema Refactor Migration
-- This migration rebuilds the entire database with the new architecture
-- WARNING: This will drop and recreate tables (safe for dummy data only)

-- ============================================
-- STEP 1: Drop Old Tables
-- ============================================

DROP TABLE IF EXISTS "project_activities" CASCADE;
DROP TABLE IF EXISTS "task_comments" CASCADE;
DROP TABLE IF EXISTS "tasks" CASCADE;
DROP TABLE IF EXISTS "project_columns" CASCADE;
DROP TABLE IF EXISTS "project_sections" CASCADE;
DROP TABLE IF EXISTS "invitations" CASCADE;
DROP TABLE IF EXISTS "project_members" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "tenant_users" CASCADE;
DROP TABLE IF EXISTS "task_priority_options" CASCADE;
DROP TABLE IF EXISTS "task_status_options" CASCADE;
DROP TABLE IF EXISTS "tenants" CASCADE;
DROP TABLE IF EXISTS "onboarding_data" CASCADE;
DROP TABLE IF EXISTS "password_resets" CASCADE;
DROP TABLE IF EXISTS "otp_codes" CASCADE;
DROP TABLE IF EXISTS "subscription_plans" CASCADE;
DROP TABLE IF EXISTS "onboarding_options" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- ============================================
-- STEP 2: Drop Old Enums
-- ============================================

DROP TYPE IF EXISTS "TenantRole" CASCADE;
DROP TYPE IF EXISTS "ProjectRole" CASCADE;
DROP TYPE IF EXISTS "InvitationType" CASCADE;

-- ============================================
-- STEP 3: Create New Enums
-- ============================================

CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE');
CREATE TYPE "SystemRole" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'PROJECT_ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE "MembershipLevel" AS ENUM ('TENANT', 'PROJECT');
CREATE TYPE "ProjectLayout" AS ENUM ('LIST', 'BOARD', 'TIMELINE', 'CALENDAR');
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "TemplateCategory" AS ENUM ('CUSTOM', 'MARKETING', 'OPERATION', 'HR', 'IT', 'SALES', 'CAMPAIGN', 'DESIGN');
CREATE TYPE "TaskOptionType" AS ENUM ('PRIORITY', 'STATUS');
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');
CREATE TYPE "ActivityType" AS ENUM (
  'PROJECT_CREATED',
  'PROJECT_UPDATED',
  'PROJECT_STATUS_CHANGED',
  'PROJECT_DELETED',
  'PROJECT_RESTORED',
  'MEMBER_ADDED',
  'MEMBER_REMOVED',
  'TASK_CREATED',
  'TASK_UPDATED',
  'TASK_COMPLETED',
  'TASK_DELETED',
  'SECTION_CREATED',
  'SECTION_DELETED'
);
CREATE TYPE "TaskType" AS ENUM ('TASK', 'MILESTONE');

-- ============================================
-- STEP 4: Create New Tables
-- ============================================

-- Users Table
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" TEXT NOT NULL UNIQUE,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
    "googleId" TEXT UNIQUE,
    "passwordHash" TEXT,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "systemRole" "SystemRole",
    "twoFaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_googleId_idx" ON "users"("googleId");
CREATE INDEX "users_systemRole_idx" ON "users"("systemRole");

-- Onboarding Data
CREATE TABLE "onboarding_data" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL UNIQUE,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "appUsageIds" UUID[],
    "industryIds" UUID[],
    "teamSizeId" UUID,
    "roleIds" UUID[],
    "role" TEXT,
    "functions" TEXT[],
    "useCases" TEXT[],
    "projectName" TEXT,
    "tasks" JSONB,
    "sections" JSONB,
    "layoutPreference" TEXT,
    "completedAt" TIMESTAMP(3),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "onboarding_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- OTP Codes
CREATE TABLE "otp_codes" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "otp_codes_email_idx" ON "otp_codes"("email");

-- Password Resets
CREATE TABLE "password_resets" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "password_resets_email_idx" ON "password_resets"("email");
CREATE INDEX "password_resets_token_idx" ON "password_resets"("token");

-- Subscription Plans
CREATE TABLE "subscription_plans" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL UNIQUE,
    "features" JSONB NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "trialDays" INTEGER NOT NULL DEFAULT 14,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Tenants
CREATE TABLE "tenants" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "ownerId" UUID NOT NULL,
    "subscriptionPlanId" UUID NOT NULL,
    "trialEndsAt" TIMESTAMP(3),
    "productKey" TEXT,
    "emailConfig" JSONB,
    "messageConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "tenants_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("id")
);

CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");
CREATE INDEX "tenants_ownerId_idx" ON "tenants"("ownerId");

-- Memberships (NEW - Replaces TenantUser + ProjectMember)
CREATE TABLE "memberships" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "projectId" UUID,
    "level" "MembershipLevel" NOT NULL,
    "role" "SystemRole" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "memberships_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
    CONSTRAINT "memberships_userId_tenantId_projectId_key" UNIQUE ("userId", "tenantId", "projectId")
);

CREATE INDEX "memberships_userId_idx" ON "memberships"("userId");
CREATE INDEX "memberships_tenantId_idx" ON "memberships"("tenantId");
CREATE INDEX "memberships_projectId_idx" ON "memberships"("projectId");
CREATE INDEX "memberships_tenantId_level_idx" ON "memberships"("tenantId", "level");
CREATE INDEX "memberships_projectId_role_idx" ON "memberships"("projectId", "role");

-- Templates (NEW)
CREATE TABLE "templates" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "layout" "ProjectLayout" NOT NULL DEFAULT 'LIST',
    "category" "TemplateCategory" NOT NULL DEFAULT 'CUSTOM',
    "icon" TEXT,
    "thumbnail" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id")
);

CREATE INDEX "templates_isGlobal_idx" ON "templates"("isGlobal");
CREATE INDEX "templates_category_idx" ON "templates"("category");
CREATE INDEX "templates_createdBy_idx" ON "templates"("createdBy");
CREATE INDEX "templates_isGlobal_category_idx" ON "templates"("isGlobal", "category");

-- Template Sections (NEW)
CREATE TABLE "template_sections" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "templateId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "color" TEXT DEFAULT '#94a3b8',
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "template_sections_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE
);

CREATE INDEX "template_sections_templateId_idx" ON "template_sections"("templateId");
CREATE INDEX "template_sections_templateId_position_idx" ON "template_sections"("templateId", "position");

-- Template Tasks (NEW)
CREATE TABLE "template_tasks" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "templateSectionId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TaskType" NOT NULL DEFAULT 'TASK',
    "position" INTEGER NOT NULL,
    "priority" TEXT,
    "status" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "template_tasks_templateSectionId_fkey" FOREIGN KEY ("templateSectionId") REFERENCES "template_sections"("id") ON DELETE CASCADE
);

CREATE INDEX "template_tasks_templateSectionId_idx" ON "template_tasks"("templateSectionId");
CREATE INDEX "template_tasks_templateSectionId_position_idx" ON "template_tasks"("templateSectionId", "position");

-- Template Columns (NEW)
CREATE TABLE "template_columns" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "templateId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 150,
    "position" INTEGER NOT NULL,
    "options" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "template_columns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE
);

CREATE INDEX "template_columns_templateId_idx" ON "template_columns"("templateId");
CREATE INDEX "template_columns_templateId_position_idx" ON "template_columns"("templateId", "position");

-- Projects
CREATE TABLE "projects" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "templateId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#3b82f6',
    "layout" "ProjectLayout" NOT NULL DEFAULT 'LIST',
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "dueDate" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "projects_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
    CONSTRAINT "projects_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE SET NULL,
    CONSTRAINT "projects_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id"),
    CONSTRAINT "memberships_projectId_fkey" FOREIGN KEY ("id") REFERENCES "memberships"("projectId") ON DELETE CASCADE
);

CREATE INDEX "projects_tenantId_idx" ON "projects"("tenantId");
CREATE INDEX "projects_templateId_idx" ON "projects"("templateId");
CREATE INDEX "projects_createdBy_idx" ON "projects"("createdBy");
CREATE INDEX "projects_deletedAt_idx" ON "projects"("deletedAt");
CREATE INDEX "projects_tenantId_deletedAt_idx" ON "projects"("tenantId", "deletedAt");

-- Project Sections
CREATE TABLE "project_sections" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "projectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "color" TEXT DEFAULT '#94a3b8',
    "isCollapsed" BOOLEAN NOT NULL DEFAULT false,
    "kanbanWipLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_sections_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE
);

CREATE INDEX "project_sections_projectId_idx" ON "project_sections"("projectId");
CREATE INDEX "project_sections_projectId_position_idx" ON "project_sections"("projectId", "position");

-- Project Columns
CREATE TABLE "project_columns" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "projectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 150,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_columns_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE
);

CREATE INDEX "project_columns_projectId_idx" ON "project_columns"("projectId");
CREATE INDEX "project_columns_projectId_visible_idx" ON "project_columns"("projectId", "visible");

-- Tasks
CREATE TABLE "tasks" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "projectId" UUID NOT NULL,
    "sectionId" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TaskType" NOT NULL DEFAULT 'TASK',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "assigneeId" UUID,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "priority" TEXT,
    "status" TEXT,
    "approvalStatus" TEXT,
    "tags" TEXT[],
    "customFields" JSONB,
    "orderIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "parentId" UUID,
    "level" INTEGER NOT NULL DEFAULT 0,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
    CONSTRAINT "tasks_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "project_sections"("id") ON DELETE SET NULL,
    CONSTRAINT "tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id"),
    CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id"),
    CONSTRAINT "tasks_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");
CREATE INDEX "tasks_sectionId_idx" ON "tasks"("sectionId");
CREATE INDEX "tasks_createdBy_idx" ON "tasks"("createdBy");
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");
CREATE INDEX "tasks_parentId_idx" ON "tasks"("parentId");
CREATE INDEX "tasks_projectId_completed_idx" ON "tasks"("projectId", "completed");

-- Task Comments
CREATE TABLE "task_comments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "taskId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "task_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE,
    CONSTRAINT "task_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id")
);

CREATE INDEX "task_comments_taskId_idx" ON "task_comments"("taskId");
CREATE INDEX "task_comments_userId_idx" ON "task_comments"("userId");
CREATE INDEX "task_comments_taskId_createdAt_idx" ON "task_comments"("taskId", "createdAt");

-- Static Task Options (NEW - Unified)
CREATE TABLE "static_task_options" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "optionType" "TaskOptionType" NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "static_task_options_optionType_value_key" UNIQUE ("optionType", "value")
);

CREATE INDEX "static_task_options_optionType_idx" ON "static_task_options"("optionType");
CREATE INDEX "static_task_options_optionType_isActive_idx" ON "static_task_options"("optionType", "isActive");
CREATE INDEX "static_task_options_optionType_position_idx" ON "static_task_options"("optionType", "position");

-- Invitations
CREATE TABLE "invitations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "projectId" UUID,
    "email" TEXT NOT NULL,
    "invitedBy" UUID NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "role" "SystemRole" NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "invitations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
    CONSTRAINT "invitations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
    CONSTRAINT "invitations_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users"("id")
);

CREATE INDEX "invitations_tenantId_idx" ON "invitations"("tenantId");
CREATE INDEX "invitations_projectId_idx" ON "invitations"("projectId");
CREATE INDEX "invitations_email_idx" ON "invitations"("email");
CREATE INDEX "invitations_token_idx" ON "invitations"("token");
CREATE INDEX "invitations_status_expiresAt_idx" ON "invitations"("status", "expiresAt");
CREATE INDEX "invitations_email_status_idx" ON "invitations"("email", "status");

-- Project Activities
CREATE TABLE "project_activities" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "projectId" UUID NOT NULL,
    "userId" UUID,
    "type" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_activities_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
    CONSTRAINT "project_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id")
);

CREATE INDEX "project_activities_projectId_idx" ON "project_activities"("projectId");
CREATE INDEX "project_activities_userId_idx" ON "project_activities"("userId");
CREATE INDEX "project_activities_createdAt_idx" ON "project_activities"("createdAt");
CREATE INDEX "project_activities_projectId_createdAt_idx" ON "project_activities"("projectId", "createdAt");

-- Onboarding Options
CREATE TABLE "onboarding_options" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "minSize" INTEGER,
    "maxSize" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "onboarding_options_category_value_key" UNIQUE ("category", "value")
);

CREATE INDEX "onboarding_options_category_idx" ON "onboarding_options"("category");
CREATE INDEX "onboarding_options_category_isActive_idx" ON "onboarding_options"("category", "isActive");

-- ============================================
-- STEP 5: Create default subscription plan
-- ============================================

INSERT INTO "subscription_plans" ("id", "name", "features", "price", "trialDays", "createdAt", "updatedAt")
VALUES (
    uuid_generate_v4(),
    'Free',
    '{"maxProjects": 10, "maxUsers": 5, "maxStorage": 1024}',
    0.00,
    14,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

COMMENT ON TABLE "memberships" IS 'Unified membership table: tenant-level (access all projects) or project-level (specific project only)';
COMMENT ON COLUMN "memberships"."level" IS 'TENANT=access all tenant projects, PROJECT=access specific project only';
COMMENT ON TABLE "templates" IS 'Master templates created by super admins (isGlobal=true) or tenant admins';
COMMENT ON TABLE "static_task_options" IS 'Unified table for priority and status options with shared IDs across tenants';
COMMENT ON COLUMN "static_task_options"."optionType" IS 'PRIORITY or STATUS';
