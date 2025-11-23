import { staffColumn } from "@/components/tables/staffColumn";
import { getCurrentUser } from "@/lib/server/utils";
import { SearchParams } from "@/types";
import { DataTable } from "@/components/tables/data-table";
import { gql } from "@urql/core";
import {
  AccessLevel,
  GetStaffsQuery,
  GetStaffsQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";

const GET_STAFFS = gql(`
  query GetStaffs($filter: StaffFilterInput) {
    staffs(filter: $filter) {
      id
      name
      surname
      employeeId
      phone
      email
      address
      img
      class {
        id
        name
        grade {
          id
          name
        }
      }
    }
  }
`);

const StaffListPage = async ({ searchParams }: SearchParams) => {
  const { role, classId } = await searchParams;

  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetStaffsQuery, GetStaffsQueryVariables>(GET_STAFFS, {
      filter: {
        isActive: true,
        ...(role && { accessLevel: role.toUpperCase() as AccessLevel }),
        ...(classId && { classId }),
      },
    })
    .toPromise();

  const title = role ? `${role} Staffs` : "Staffs";

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={staffColumn}
        data={data?.staffs ?? []}
        title={title}
        tableFor="staff"
        accessLevel={accessLevel!}
      />
    </div>
  );
};

export default StaffListPage;
