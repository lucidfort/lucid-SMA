import { payrollProfileColumns } from "@/components/tables/payrollProfileColumns"
import { DataTable } from "@/components/tables/data-table"
import { getCurrentUser } from "@/lib/server/utils"
import { createUrqlServerClient } from "@/lib/urql/clients/server.client"
import { gql } from "@urql/core"

const GET_STAFF_ACCOUNT_DETAILS = gql(`
 query GetStaffAccountDetails {
    payrollProfile{
        id 
        accountName 
        accountNumber 
        bankName 
        salary
        staff {
            id
            name 
            surname
        }
    }
 }
`)
const AccountDetailsList = async () => {
    const { accessLevel } = await getCurrentUser()

    const { client } = await createUrqlServerClient()
    const { data } = await client.query(GET_STAFF_ACCOUNT_DETAILS, {})

    return (
        <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
            <DataTable
                accessLevel={accessLevel!}
                columns={payrollProfileColumns}
                data={data?.payrollProfile ?? []}
                tableFor="payroll-profile"
                title="Staff Bank Account Details"
            />
        </div>
    )
}

export default AccountDetailsList