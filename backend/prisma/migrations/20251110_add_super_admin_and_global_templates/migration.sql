-- AddSuperAdminAndGlobalTemplates
-- Add isSuperAdmin to users table
ALTER TABLE "users" ADD COLUMN "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Add isGlobal to projects table for global templates
ALTER TABLE "projects" ADD COLUMN "isGlobal" BOOLEAN NOT NULL DEFAULT false;

-- Make tenantId optional for global templates (allow NULL)
ALTER TABLE "projects" ALTER COLUMN "tenantId" DROP NOT NULL;

-- Add indexes for performance
CREATE INDEX "users_isSuperAdmin_idx" ON "users"("isSuperAdmin");
CREATE INDEX "projects_isGlobal_idx" ON "projects"("isGlobal");
CREATE INDEX "projects_tenantId_isTemplate_isGlobal_deletedAt_idx" ON "projects"("tenantId", "isTemplate", "isGlobal", "deletedAt");

-- Add comments for documentation
COMMENT ON COLUMN "users"."isSuperAdmin" IS 'Super admins can manage global templates and system settings';
COMMENT ON COLUMN "projects"."isGlobal" IS 'Global templates are accessible to all tenants (managed by super admins)';
COMMENT ON COLUMN "projects"."tenantId" IS 'Optional: NULL for global templates, required for tenant-specific projects';
