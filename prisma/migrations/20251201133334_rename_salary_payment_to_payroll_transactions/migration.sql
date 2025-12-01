/*
  Warnings:

  - You are about to drop the `SalaryPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalaryPaymentLine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SalaryPayment" DROP CONSTRAINT "SalaryPayment_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SalaryPayment" DROP CONSTRAINT "SalaryPayment_staffId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SalaryPaymentLine" DROP CONSTRAINT "SalaryPaymentLine_salaryPaymentId_fkey";

-- DropTable
DROP TABLE "public"."SalaryPayment";

-- DropTable
DROP TABLE "public"."SalaryPaymentLine";

-- CreateTable
CREATE TABLE "public"."PayrollTransactions" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "grossAmount" INTEGER NOT NULL,
    "netAmount" INTEGER NOT NULL,
    "payYear" INTEGER NOT NULL,
    "payMonth" INTEGER NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "schoolId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PayrollTransactionLine" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "public"."PaymentLineType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "salaryPaymentId" TEXT NOT NULL,

    CONSTRAINT "PayrollTransactionLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayrollTransactions_reference_key" ON "public"."PayrollTransactions"("reference");

-- AddForeignKey
ALTER TABLE "public"."PayrollTransactions" ADD CONSTRAINT "PayrollTransactions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PayrollTransactions" ADD CONSTRAINT "PayrollTransactions_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PayrollTransactionLine" ADD CONSTRAINT "PayrollTransactionLine_salaryPaymentId_fkey" FOREIGN KEY ("salaryPaymentId") REFERENCES "public"."PayrollTransactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
