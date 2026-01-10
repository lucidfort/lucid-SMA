import PaymentVerificator from "@/components/dashboard/PaymentVerificator";
import { DataTable } from "@/components/table/column/data-table";
import { transactionsColumn } from "@/components/table/column/transactionsColumn";
import {
  GetTransactionsQuery,
  GetTransactionsQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import type { SearchParams } from "@/types";
import { gql } from "@urql/core";
import { ITEMS_PER_PAGE } from "@/lib/settings";

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
  const { reference, invoice, page, term } = await searchParams;

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetTransactionsQuery, GetTransactionsQueryVariables>(
      GET_TRANSACTIONS,
      {
        filter: {
          skip: page ? (Number(page) - 1) * ITEMS_PER_PAGE : undefined,
          take: ITEMS_PER_PAGE,
          invoiceId: invoice,
          termId: term,
          reference,
        },
      },
    )
    .toPromise();

  const { accessLevel } = await getCurrentUser();

  const transactions = data?.invoicePayments || [];
  const hasNextPage = transactions.length > ITEMS_PER_PAGE;

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        accessLevel={accessLevel!}
        columns={transactionsColumn}
        data={data?.invoicePayments ?? []}
        tableFor="transaction"
        title="Recent Transactions"
        filters={{
          selectCount: false,
          listCreation: false,
          termFilter: true,
        }}
        pagination={{
          page: page ?? 1,
          hasNextPage,
        }}
      />

      {reference && <PaymentVerificator mode="auto" reference={reference} />}
    </div>
  );
};

export default TransactionsListPage;
