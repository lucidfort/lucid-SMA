import PaymentVerification from "@/components/PaymentVerification";
import { DataTable } from "@/components/tables/data-table";
import { transactionsColumn } from "@/components/tables/transactionsColumn";
import {
  GetTransactionsQuery,
  GetTransactionsQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import type { SearchParams } from "@/types";
import { gql } from "@urql/core";

const GET_TRANSACTIONS = gql(`
  query GetTransactions($filter: InvoicePaymentFilter!) {
    invoicePayments(filter: $filter) {
      id 
      amountPaid
      students {
        name surname
      }
      invoice {
        id
        number
      }
      createdAt
      paidAt
      method
      payerEmail
      reference
      status
    }
  }
`);

const TransactionsListPage = async ({ searchParams }: SearchParams) => {
  const { search, reference } = await searchParams;
  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<
    GetTransactionsQuery,
    GetTransactionsQueryVariables
  >(GET_TRANSACTIONS, { filter: { studentName: search, reference } });

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        accessLevel={accessLevel!}
        columns={transactionsColumn}
        data={data?.invoicePayments ?? []}
        tableFor="transaction"
        title="Recent Payments"
      />

      {reference && (
        <PaymentVerification reference={reference} userRole={accessLevel!} />
      )}
    </div>
  );
};

export default TransactionsListPage;
