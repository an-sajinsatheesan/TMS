-- CreateEnum for ProjectStatus
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum for TemplateCategory
CREATE TYPE "TemplateCategory" AS ENUM ('CUSTOM', 'MARKETING', 'OPERATION', 'HR', 'IT', 'SALES', 'CAMPAIGN', 'DESIGN');

-- CreateEnum for ActivityType
CREATE TYPE "ActivityType" AS ENUM ('PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_STATUS_CHANGED', 'PROJECT_DELETED', 'PROJECT_RESTORED', 'MEMBER_ADDED', 'MEMBER_REMOVED', 'TASK_CREATED', 'TASK_UPDATED', 'TASK_COMPLETED', 'TASK_DELETED', 'SECTION_CREATED', 'SECTION_DELETED');

-- AlterTable projects - Add new columns
ALTER TABLE "projects" ADD COLUMN "description" TEXT;
ALTER TABLE "projects" ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "projects" ADD COLUMN "dueDate" TIMESTAMP(3);
ALTER TABLE "projects" ADD COLUMN "isTemplate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN "templateCategory" "TemplateCategory" NOT NULL DEFAULT 'CUSTOM';
ALTER TABLE "projects" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateTable project_activities
CREATE TABLE "project_activities" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "projectId" UUID NOT NULL,
    "userId" UUID,
    "type" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_deletedAt_idx" ON "projects"("deletedAt");
CREATE INDEX "projects_isTemplate_idx" ON "projects"("isTemplate");
CREATE INDEX "project_activities_projectId_idx" ON "project_activities"("projectId");
CREATE INDEX "project_activities_userId_idx" ON "project_activities"("userId");
CREATE INDEX "project_activities_createdAt_idx" ON "project_activities"("createdAt");

-- AddForeignKey
ALTER TABLE "project_activities" ADD CONSTRAINT "project_activities_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_activities" ADD CONSTRAINT "project_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
