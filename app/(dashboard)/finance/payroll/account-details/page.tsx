import { payrollProfileColumns } from "@/components/table/column/payrollProfilesColumn";
import { DataTable } from "@/components/table/column/data-table";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { gql } from "@urql/core";
import {
  GetPayrollProfilesQuery,
  GetPayrollProfilesQueryVariables,
} from "@/lib/generated/graphql/server";

const GET_PAYROLL_PROFILES = gql(`
 query GetPayrollProfiles($active: Boolean!) {
    payrollProfile(active: $active){
        id 
        accountName 
        accountNumber 
        recipientCode
        bankName 
      bankCode
        salary
        staff {
            id
            name 
            surname
          employeeId
        }
    }
 }
`);
const AccountDetailsList = async () => {
  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetPayrollProfilesQuery, GetPayrollProfilesQueryVariables>(
      GET_PAYROLL_PROFILES,
      {
        active: true,
      },
    )
    .toPromise();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        accessLevel={accessLevel!}
        columns={payrollProfileColumns}
        data={data?.payrollProfile ?? []}
        tableFor="payroll-profile"
        title="Staff Account Details"
        filters={{
          selectCount: false,
        }}
      />
    </div>
  );
};

export default AccountDetailsList;
