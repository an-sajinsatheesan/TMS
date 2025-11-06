-- CreateTable
CREATE TABLE IF NOT EXISTS "onboarding_options" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
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

    CONSTRAINT "onboarding_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "task_status_options" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_status_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "task_priority_options" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_priority_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "onboarding_options_category_value_key" ON "onboarding_options"("category", "value");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "onboarding_options_category_idx" ON "onboarding_options"("category");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "task_status_options_value_key" ON "task_status_options"("value");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "task_priority_options_value_key" ON "task_priority_options"("value");

-- Migrate data from old tables to new consolidated table (if old tables exist)
DO $$
BEGIN
    -- Migrate app_usage_options
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'app_usage_options') THEN
        INSERT INTO onboarding_options (id, category, label, value, description, icon, "isActive", position, "createdAt", "updatedAt")
        SELECT id, 'app_usage', label, value, description, icon, "isActive", position, "createdAt", "updatedAt"
        FROM app_usage_options
        ON CONFLICT (category, value) DO NOTHING;
    END IF;

    -- Migrate industry_options
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'industry_options') THEN
        INSERT INTO onboarding_options (id, category, label, value, description, icon, "isActive", position, "createdAt", "updatedAt")
        SELECT id, 'industry', label, value, description, icon, "isActive", position, "createdAt", "updatedAt"
        FROM industry_options
        ON CONFLICT (category, value) DO NOTHING;
    END IF;

    -- Migrate team_size_options
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'team_size_options') THEN
        INSERT INTO onboarding_options (id, category, label, value, description, "minSize", "maxSize", "isActive", position, "createdAt", "updatedAt")
        SELECT id, 'team_size', label, value, description, "minSize", "maxSize", "isActive", position, "createdAt", "updatedAt"
        FROM team_size_options
        ON CONFLICT (category, value) DO NOTHING;
    END IF;

    -- Migrate role_options
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'role_options') THEN
        INSERT INTO onboarding_options (id, category, label, value, description, icon, "isActive", position, "createdAt", "updatedAt")
        SELECT id, 'role', label, value, description, icon, "isActive", position, "createdAt", "updatedAt"
        FROM role_options
        ON CONFLICT (category, value) DO NOTHING;
    END IF;
END $$;

-- Drop old tables (after data migration)
DROP TABLE IF EXISTS "app_usage_options";
DROP TABLE IF EXISTS "industry_options";
DROP TABLE IF EXISTS "team_size_options";
DROP TABLE IF EXISTS "role_options";
