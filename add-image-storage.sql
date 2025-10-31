// Add image storage support to the database schema
// This migration will add support for storing images directly in Neon

-- Add image storage columns to MenuItem table
ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "imageData" TEXT;
ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "imageMimeType" VARCHAR(100);
ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "imageSize" INTEGER;

-- Add comments for clarity
COMMENT ON COLUMN "MenuItem"."imageData" IS 'Base64 encoded image data';
COMMENT ON COLUMN "MenuItem"."imageMimeType" IS 'MIME type of the image (e.g., image/jpeg, image/png)';
COMMENT ON COLUMN "MenuItem"."imageSize" IS 'Size of the image in bytes';

-- Create index for better performance when querying images
CREATE INDEX IF NOT EXISTS "idx_menuitem_has_image" ON "MenuItem" ("imageData") WHERE "imageData" IS NOT NULL;