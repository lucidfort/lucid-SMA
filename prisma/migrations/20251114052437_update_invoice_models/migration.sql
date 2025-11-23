/*
  Warnings:

  - You are about to drop the column `classId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `issuedDate` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Invoice` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to drop the column `createdAt` on the `InvoicePayment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `InvoicePayment` table. All the data in the column will be lost.
  - You are about to alter the column `amountPaid` on the `InvoicePayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `DoublePrecision`.
  - You are about to drop the `InvoiceLine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Invoice" DROP CONSTRAINT "Invoice_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InvoiceLine" DROP CONSTRAINT "InvoiceLine_invoiceId_fkey";

-- DropIndex
DROP INDEX "public"."Invoice_schoolId_studentId_status_idx";

-- DropIndex
DROP INDEX "public"."InvoicePayment_schoolId_paymentDate_status_idx";

-- DropIndex
DROP INDEX "public"."Parent_schoolId_name_surname_idx";

-- AlterTable
ALTER TABLE "public"."Invoice" DROP COLUMN "classId",
DROP COLUMN "issuedDate",
DROP COLUMN "status",
ADD COLUMN     "description" TEXT,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."InvoicePayment" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "amountPaid" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "public"."InvoiceLine";

-- DropEnum
DROP TYPE "public"."InvoiceStatus";
