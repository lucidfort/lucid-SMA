import { payrollProfileColumns } from "@/components/tables/payrollProfilesColumn"
import { DataTable } from "@/components/tables/data-table"
import { getCurrentUser } from "@/lib/server/utils"
import { createUrqlServerClient } from "@/lib/urql/clients/server.client"
import { gql } from "@urql/core"
import { GetPayrollProfilesQuery, GetPayrollProfilesQueryVariables } from "@/lib/generated/graphql/server"

const GET_PAYROLL_PROFILES = gql(`
 query GetPayrollProfiles {
    payrollProfile{
        id 
        accountName 
        accountNumber 
        recipientCode
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
    const { data } = await client.query<GetPayrollProfilesQuery, GetPayrollProfilesQueryVariables>(GET_PAYROLL_PROFILES, {})

    return (
        <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
            <DataTable
                accessLevel={accessLevel!}
                columns={payrollProfileColumns}
                data={data?.payrollProfile ?? []}
                tableFor="payroll-profile"
                title="Staff Account Details"
            />
        </div>
    )
}

export default AccountDetailsList