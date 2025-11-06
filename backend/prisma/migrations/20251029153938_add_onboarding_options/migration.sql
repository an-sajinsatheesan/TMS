-- AlterTable
ALTER TABLE "onboarding_data" ADD COLUMN     "appUsageIds" UUID[],
ADD COLUMN     "industryIds" UUID[],
ADD COLUMN     "roleIds" UUID[],
ADD COLUMN     "teamSizeId" UUID;

-- CreateTable
CREATE TABLE "app_usage_options" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_usage_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_options" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_size_options" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "minSize" INTEGER,
    "maxSize" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_size_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_options" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_usage_options_value_key" ON "app_usage_options"("value");

-- CreateIndex
CREATE UNIQUE INDEX "industry_options_value_key" ON "industry_options"("value");

-- CreateIndex
CREATE UNIQUE INDEX "team_size_options_value_key" ON "team_size_options"("value");

-- CreateIndex
CREATE UNIQUE INDEX "role_options_value_key" ON "role_options"("value");
