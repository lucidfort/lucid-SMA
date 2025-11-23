import { gql } from "@urql/core";
import { endOfYear, format, getMonth, startOfYear } from "date-fns";
import Image from "next/image";

import { GetTransactionsSummaryQuery, GetTransactionsSummaryQueryVariables, PaymentStatus } from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import dynamic from "next/dynamic";

const FinanceChart = dynamic(() => import("./FinanceChart"), {
  loading: () => <h1>Loading...</h1>,
});

const GET_FINANCE_SUMMARY = gql(`
  query GetTransactionsSummary($filter: InvoicePaymentFilter!) {
    invoicePayments(filter: $filter) {
      id
      amountPaid
      paidAt
    }
  }  
`)

const FinanceChartContainer = async () => {
  const startOfYearDate = startOfYear(new Date())
  const endOfYearDate = endOfYear(new Date())

  const { client } = await createUrqlServerClient()
  const { data: response } = await client.query<GetTransactionsSummaryQuery, GetTransactionsSummaryQueryVariables>(
    GET_FINANCE_SUMMARY, {
    filter: {
      startDate: startOfYearDate,
      endDate: endOfYearDate,
      status: PaymentStatus.Success
    }
  })

  const invoicePayments = response?.invoicePayments ?? []

  const months = Array.from({ length: 12 }, (_, i) =>
    format(new Date(2000, i, 1), "MMM")
  )

  const data = months.map((name) => ({
    name,
    income: 0,
    expense: 0,
  }));


  // EXPENSES
  for (const tx of invoicePayments) {
    const monthIndex = getMonth(tx.paidAt)
    data[monthIndex].expense += parseInt(
      tx.amountPaid.toString().replace(/,/g, "")
    )
  }

  // INCOME
  for (const tx of invoicePayments) {
    const monthIndex = getMonth(tx.paidAt)
    data[monthIndex].income += parseInt(
      tx.amountPaid.toString().replace(/,/g, ""),
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
