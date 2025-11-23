-- Add onboarding and creator fields
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_completed_at" TIMESTAMP(6) WITH TIME ZONE;

-- Add composite index for creator queries
CREATE INDEX IF NOT EXISTS "users_role_isVerified_isFeatured_idx" ON "users"("role", "is_verified", "is_featured");