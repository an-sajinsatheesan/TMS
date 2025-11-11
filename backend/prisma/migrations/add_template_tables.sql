-- Add Template Tables for SaaS System

-- Create templates table
CREATE TABLE IF NOT EXISTS "templates" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#3b82f6',
    "layout" "ProjectLayout" NOT NULL DEFAULT 'LIST',
    "category" "TemplateCategory" NOT NULL DEFAULT 'CUSTOM',
    "icon" TEXT,
    "thumbnail" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "templates_isGlobal_idx" ON "templates"("isGlobal");
CREATE INDEX IF NOT EXISTS "templates_category_idx" ON "templates"("category");
CREATE INDEX IF NOT EXISTS "templates_createdBy_idx" ON "templates"("createdBy");

-- Create template_sections table
CREATE TABLE IF NOT EXISTS "template_sections" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "templateId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "color" TEXT DEFAULT '#94a3b8',
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "template_sections_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "template_sections_templateId_idx" ON "template_sections"("templateId");

-- Create template_columns table
CREATE TABLE IF NOT EXISTS "template_columns" (
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
    CONSTRAINT "template_columns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "template_columns_templateId_idx" ON "template_columns"("templateId");

-- Create template_tasks table
CREATE TABLE IF NOT EXISTS "template_tasks" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sectionId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TaskType" NOT NULL DEFAULT 'TASK',
    "position" INTEGER NOT NULL,
    "priority" TEXT,
    "status" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "template_tasks_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "template_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "template_tasks_sectionId_idx" ON "template_tasks"("sectionId");

-- Add templateId to projects table (if not exists check done inline)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='templateId') THEN
        ALTER TABLE "projects" ADD COLUMN "templateId" UUID;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "projects_templateId_idx" ON "projects"("templateId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='projects_templateId_fkey') THEN
        ALTER TABLE "projects" ADD CONSTRAINT "projects_templateId_fkey"
            FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
