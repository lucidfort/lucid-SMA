/*
  Warnings:

  - You are about to drop the column `studentId` on the `Invoice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Invoice" DROP CONSTRAINT "Invoice_studentId_fkey";

-- AlterTable
ALTER TABLE "public"."Invoice" DROP COLUMN "studentId";

-- CreateTable
CREATE TABLE "public"."_InvoicePaymentToStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InvoicePaymentToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InvoicePaymentToStudent_B_index" ON "public"."_InvoicePaymentToStudent"("B");

-- AddForeignKey
ALTER TABLE "public"."_InvoicePaymentToStudent" ADD CONSTRAINT "_InvoicePaymentToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."InvoicePayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InvoicePaymentToStudent" ADD CONSTRAINT "_InvoicePaymentToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
