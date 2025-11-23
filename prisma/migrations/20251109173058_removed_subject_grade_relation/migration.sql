/*
  Warnings:

  - You are about to drop the column `gradeId` on the `TeacherSubjectAssignment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[schoolId,teacherId,subjectId]` on the table `TeacherSubjectAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."TeacherSubjectAssignment" DROP CONSTRAINT "TeacherSubjectAssignment_gradeId_fkey";

-- DropIndex
DROP INDEX "public"."TeacherSubjectAssignment_schoolId_teacherId_subjectId_grade_key";

-- AlterTable
ALTER TABLE "public"."TeacherSubjectAssignment" DROP COLUMN "gradeId";

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSubjectAssignment_schoolId_teacherId_subjectId_key" ON "public"."TeacherSubjectAssignment"("schoolId", "teacherId", "subjectId");
