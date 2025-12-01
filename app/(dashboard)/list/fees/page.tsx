import { DataTable } from "@/components/tables/data-table"
import { invoicesColumn } from "@/components/tables/invoicesColumn"
import { GetInvoicesQuery, GetInvoicesQueryVariables } from "@/lib/generated/graphql/server"
import { getCurrentUser } from "@/lib/server/utils"
import { createUrqlServerClient } from "@/lib/urql/clients/server.client"
import { gql } from "@urql/core"

const GET_INVOICES = gql(`
  query GetInvoices {
    invoices {
      id 
      number 
      title 
      amount 
      dueDate 
      term {
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
`)

const InvoicesList = async () => {
  const { accessLevel } = await getCurrentUser()

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<GetInvoicesQuery, GetInvoicesQueryVariables>(GET_INVOICES, {})

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <DataTable
        columns={invoicesColumn}
        data={data?.invoices ?? []}
        accessLevel={accessLevel!}
        tableFor="invoice"
        title="Recent Invoices"
      />
    </div>
  )
}

export default InvoicesList
