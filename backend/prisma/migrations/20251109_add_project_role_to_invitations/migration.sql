-- Add projectRole field to invitations table
ALTER TABLE "invitations" ADD COLUMN "projectRole" "ProjectRole" DEFAULT 'MEMBER';
