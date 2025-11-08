-- AlterTable
ALTER TABLE "onboarding_options" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "project_columns" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "color" TEXT DEFAULT '#3b82f6';

-- AlterTable
ALTER TABLE "task_priority_options" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "task_status_options" ALTER COLUMN "id" DROP DEFAULT;
