/*
  Warnings:

  - Made the column `classId` on table `StudentAttendance` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."StudentAttendance" DROP CONSTRAINT "StudentAttendance_classId_fkey";

-- AlterTable
ALTER TABLE "public"."StudentAttendance" ALTER COLUMN "classId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."StudentAttendance" ADD CONSTRAINT "StudentAttendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
