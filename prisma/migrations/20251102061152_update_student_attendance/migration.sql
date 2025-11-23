/*
  Warnings:

  - You are about to drop the column `remarks` on the `Result` table. All the data in the column will be lost.
  - You are about to alter the column `score` on the `Result` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `clerkUserId` on the `Student` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Student_clerkUserId_key";

-- AlterTable
ALTER TABLE "public"."Result" DROP COLUMN "remarks",
ALTER COLUMN "score" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "clerkUserId";

-- AlterTable
ALTER TABLE "public"."StudentAttendance" ALTER COLUMN "classId" DROP NOT NULL;
