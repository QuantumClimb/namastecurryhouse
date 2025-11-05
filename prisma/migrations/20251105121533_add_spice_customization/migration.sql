/*
  Warnings:

  - You are about to drop the column `spiceLevel` on the `MenuItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "spiceLevel",
ADD COLUMN     "hasSpiceCustomization" BOOLEAN NOT NULL DEFAULT false;
