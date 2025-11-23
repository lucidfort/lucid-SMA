/*
  Warnings:

  - You are about to drop the column `gradeId` on the `Invoice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Invoice" DROP CONSTRAINT "Invoice_gradeId_fkey";

-- AlterTable
ALTER TABLE "public"."Invoice" DROP COLUMN "gradeId";

-- CreateTable
CREATE TABLE "public"."_GradeToInvoice" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GradeToInvoice_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GradeToInvoice_B_index" ON "public"."_GradeToInvoice"("B");

-- AddForeignKey
ALTER TABLE "public"."_GradeToInvoice" ADD CONSTRAINT "_GradeToInvoice_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GradeToInvoice" ADD CONSTRAINT "_GradeToInvoice_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
