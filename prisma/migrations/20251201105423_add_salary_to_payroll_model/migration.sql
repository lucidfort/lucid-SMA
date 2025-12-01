/*
  Warnings:

  - Added the required column `salary` to the `StaffPayrollProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."StaffPayrollProfile" ADD COLUMN     "salary" INTEGER NOT NULL;
