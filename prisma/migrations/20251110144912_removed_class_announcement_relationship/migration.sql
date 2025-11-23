/*
  Warnings:

  - You are about to drop the column `classId` on the `Announcement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Announcement" DROP CONSTRAINT "Announcement_classId_fkey";

-- DropIndex
DROP INDEX "public"."TeacherSubjectAssignment_schoolId_teacherId_isActive_idx";

-- AlterTable
ALTER TABLE "public"."Announcement" DROP COLUMN "classId";
