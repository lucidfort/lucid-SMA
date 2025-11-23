-- AlterTable
ALTER TABLE "public"."StaffAttendance" ALTER COLUMN "clockInTime" DROP NOT NULL,
ALTER COLUMN "clockInTime" DROP DEFAULT;
