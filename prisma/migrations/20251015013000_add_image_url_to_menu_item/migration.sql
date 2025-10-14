-- Add imageUrl column to MenuItem (nullable) if it does not already exist
ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
