/*
  Warnings:

  - Made the column `projectRole` on table `invitations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "invitations" ALTER COLUMN "projectRole" SET NOT NULL;

-- AlterTable
ALTER TABLE "project_activities" ALTER COLUMN "id" DROP DEFAULT;
