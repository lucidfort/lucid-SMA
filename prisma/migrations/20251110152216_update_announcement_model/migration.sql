/*
  Warnings:

  - You are about to drop the column `draftedAt` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Announcement` table. All the data in the column will be lost.
  - Made the column `publishedAt` on table `Announcement` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."Event_schoolId_startTime_group_idx";

-- AlterTable
ALTER TABLE "public"."Announcement" DROP COLUMN "draftedAt",
DROP COLUMN "isPublished",
ALTER COLUMN "publishedAt" SET NOT NULL,
ALTER COLUMN "publishedAt" SET DEFAULT CURRENT_TIMESTAMP;
