import EventCalendar from "@/components/dashboard/EventCalendar";
import { DataTable } from "@/components/table/column/data-table";
import { payrollTransactionsColumn } from "@/components/table/column/payrollTransactionsColumn";
import {
  GetPayrollTransactionsQuery,
  GetPayrollTransactionsQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { SearchParams } from "@/types";
import { gql } from "@urql/core";
import { format, getMonth, getYear } from "date-fns";

const GET_PAYROLL_TRANSACTIONS = gql(`
    query GetPayrollTransactions($active: Boolean!, $transactionsFilter: PayrollTransactionsFilter!) {
        payrollProfile(active: $active){
            id
            salary
            recipientCode
            accountName
            accountNumber
            staff {
                id
                name
                surname
            }
            transactions(filter: $transactionsFilter) {
                id
                amount
                status
            }
        }
    }
`);

const PayrollTransactionsPage = async ({ searchParams }: SearchParams) => {
  const { date } = await searchParams;
  const { accessLevel } = await getCurrentUser();

  const targetDate = date ? new Date(`${date}T08:12:00Z`) : new Date();

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<
    GetPayrollTransactionsQuery,
    GetPayrollTransactionsQueryVariables
  >(GET_PAYROLL_TRANSACTIONS, {
    active: true,
    transactionsFilter: {
      month: getMonth(targetDate),
      year: getYear(targetDate),
    },
  });

  const formattedDate = format(targetDate, "MMMM yyy");

  const formattedData =
    data?.payrollProfile?.map(({ transactions, ...profile }) => ({
      ...profile,
      transaction: transactions?.[0],
      date: formattedDate,
    })) || [];

  return (
    <div className="mt-0 w-full space-y-8 p-4">
      <div className="w-full rounded-md bg-white p-4">
        <EventCalendar view="year" />
      </div>

      <div className="w-full rounded-md bg-white p-4">
        <DataTable
          accessLevel={accessLevel!}
          columns={payrollTransactionsColumn}
          data={formattedData}
          tableFor="payroll-transaction"
          title={`Transactions for ${formattedDate}`}
          filters={{
            sortFilter: false,
            listCreation: false,
            selectCount: false,
          }}
        />
      </div>
    </div>
  );
};

export default PayrollTransactionsPage;
