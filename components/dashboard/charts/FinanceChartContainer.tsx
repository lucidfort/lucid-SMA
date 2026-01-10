import Image from "next/image";
import dynamic from "next/dynamic";
import { format, getMonth } from "date-fns";
import {
  InvoicePayment,
  PayrollTransaction,
} from "@/lib/generated/graphql/server";

const FinanceChart = dynamic(() => import("./FinanceChart"), {
  loading: () => <h1>Loading...</h1>,
});

interface Props {
  invoicePayments: Pick<InvoicePayment, "id" | "amountPaid" | "paidAt">[];
  payrollTransactions: Pick<
    PayrollTransaction,
    "id" | "amount" | "paymentDate"
  >[];
}

const FinanceChartContainer = ({
  invoicePayments,
  payrollTransactions,
}: Props) => {
  const months = Array.from({ length: 12 }, (_, i) =>
    format(new Date(2000, i, 1), "MMM"),
  );

  const data = months.map((name) => ({
    name,
    income: 0,
    expense: 0,
  }));

  // EXPENSES
  for (const tx of payrollTransactions) {
    const monthIndex = getMonth(tx.paymentDate);
    data[monthIndex].expense += parseInt(
      (tx?.amount ?? 0).toString().replace(/,/g, ""),
    );
  }

  // INCOME
  for (const tx of invoicePayments) {
    const monthIndex = getMonth(tx.paidAt);
    data[monthIndex].income += parseInt(
      (tx?.amountPaid ?? 0).toString().replace(/,/g, ""),
    );
  }

  return (
    <div className="h-full w-full rounded-xl bg-white p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Finance</h1>
        <Image src="/moreDark.svg" alt="more" width={20} height={20} />
      </div>

      <FinanceChart data={data} />
    </div>
  );
};

export default FinanceChartContainer;
