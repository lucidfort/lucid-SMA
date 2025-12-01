/*
  Warnings:

  - You are about to drop the column `amountPaid` on the `SalaryPayment` table. All the data in the column will be lost.
  - You are about to drop the column `deductionReason` on the `SalaryPayment` table. All the data in the column will be lost.
  - You are about to drop the column `deductions` on the `SalaryPayment` table. All the data in the column will be lost.
  - You are about to drop the column `payPeriod` on the `SalaryPayment` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `SalaryPayment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reference]` on the table `SalaryPayment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `grossAmount` to the `SalaryPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netAmount` to the `SalaryPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payMonth` to the `SalaryPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payYear` to the `SalaryPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankCode` to the `StaffBankAccount` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `accountNumber` on the `StaffBankAccount` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentLineType" AS ENUM ('ALLOWANCE', 'DEDUCTION');

-- DropIndex
DROP INDEX "public"."SalaryPayment_schoolId_reference_key";

-- DropIndex
DROP INDEX "public"."SalaryPayment_schoolId_status_idx";

-- AlterTable
ALTER TABLE "public"."SalaryPayment" DROP COLUMN "amountPaid",
DROP COLUMN "deductionReason",
DROP COLUMN "deductions",
DROP COLUMN "payPeriod",
DROP COLUMN "totalAmount",
ADD COLUMN     "grossAmount" INTEGER NOT NULL,
ADD COLUMN     "netAmount" INTEGER NOT NULL,
ADD COLUMN     "payMonth" INTEGER NOT NULL,
ADD COLUMN     "payYear" INTEGER NOT NULL,
ALTER COLUMN "paymentDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."StaffBankAccount" ADD COLUMN     "bankCode" TEXT NOT NULL,
DROP COLUMN "accountNumber",
ADD COLUMN     "accountNumber" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."SalaryPaymentLine" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "public"."PaymentLineType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "salaryPaymentId" TEXT NOT NULL,

    CONSTRAINT "SalaryPaymentLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalaryPayment_reference_key" ON "public"."SalaryPayment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "StaffBankAccount_staffId_accountNumber_bankName_key" ON "public"."StaffBankAccount"("staffId", "accountNumber", "bankName");

-- AddForeignKey
ALTER TABLE "public"."SalaryPaymentLine" ADD CONSTRAINT "SalaryPaymentLine_salaryPaymentId_fkey" FOREIGN KEY ("salaryPaymentId") REFERENCES "public"."SalaryPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
