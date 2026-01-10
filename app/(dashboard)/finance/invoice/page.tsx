import { DataTable } from "@/components/table/column/data-table";
import { invoicesColumn } from "@/components/table/column/invoicesColumn";
import {
  GetInvoicesQuery,
  GetInvoicesQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { SearchParams } from "@/types";
import { gql } from "@urql/core";

const GET_INVOICES = gql(`
  query GetInvoices($filter: InvoiceFilter, $includeHasPaid: Boolean!) {
    invoices(filter: $filter) {
      id 
      number 
      title 
      amount 
      dueDate 
      hasPaid @include(if: $includeHasPaid)
      term {
        id
        session
        academicYear {
          year
        }
      }
      grades {
        id
        name
      }
    }
  }
`);

const InvoicesList = async ({ searchParams }: SearchParams) => {
  const { term, grade } = await searchParams;
  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<
    GetInvoicesQuery,
    GetInvoicesQueryVariables
  >(GET_INVOICES, {
    filter: {
      termId: term,
      gradeId: grade,
    },
    includeHasPaid: accessLevel === "parent",
  });

  const invoices = (data?.invoices || []).map((i) => ({ ...i, accessLevel }));

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={invoicesColumn}
        data={invoices}
        accessLevel={accessLevel!}
        tableFor="invoice"
        title="Recent Invoices"
        filters={{
          termFilter: true,
          selectCount: false,
          listCreation: true,
        }}
      />
    </div>
  );
};

export default InvoicesList;
