/*
  Warnings:

  - You are about to drop the column `narration` on the `InvoicePayment` table. All the data in the column will be lost.
  - You are about to drop the column `payerName` on the `InvoicePayment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDate` on the `InvoicePayment` table. All the data in the column will be lost.
  - You are about to drop the column `providerReference` on the `InvoicePayment` table. All the data in the column will be lost.
  - Added the required column `payerEmail` to the `InvoicePayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."InvoicePayment" DROP COLUMN "narration",
DROP COLUMN "payerName",
DROP COLUMN "paymentDate",
DROP COLUMN "providerReference",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "payerEmail" TEXT NOT NULL,
ALTER COLUMN "method" DROP NOT NULL;
