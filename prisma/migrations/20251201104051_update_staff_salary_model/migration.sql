/*
  Warnings:

  - You are about to drop the `StaffBankAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."StaffBankAccount" DROP CONSTRAINT "StaffBankAccount_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StaffBankAccount" DROP CONSTRAINT "StaffBankAccount_staffId_fkey";

-- DropTable
DROP TABLE "public"."StaffBankAccount";

-- CreateTable
CREATE TABLE "public"."StaffPayrollProfile" (
    "id" TEXT NOT NULL,
    "accountNumber" INTEGER NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "StaffPayrollProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffPayrollProfile_staffId_key" ON "public"."StaffPayrollProfile"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffPayrollProfile_staffId_accountNumber_bankName_key" ON "public"."StaffPayrollProfile"("staffId", "accountNumber", "bankName");

-- AddForeignKey
ALTER TABLE "public"."StaffPayrollProfile" ADD CONSTRAINT "StaffPayrollProfile_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StaffPayrollProfile" ADD CONSTRAINT "StaffPayrollProfile_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
