import { staffColumn } from "@/components/table/column/staffColumn";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { SearchParams } from "@/types";
import { DataTable } from "@/components/table/column/data-table";
import { gql } from "@urql/core";
import {
  AccessLevel,
  GetStaffsQuery,
  GetStaffsQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/server.client";

const GET_STAFFS = gql(`
  query GetStaffs($filter: StaffFilter) {
    staffs(filter: $filter) {
      id
      name
      surname
      employeeId
      phone
      email
      address
      img
      assignedClass {
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
  }
`);

const StaffListPage = async ({ searchParams }: SearchParams) => {
  const { role, classId } = await searchParams;
  const { client } = await createUrqlServerClient();
  const { data } = await client.query<GetStaffsQuery, GetStaffsQueryVariables>(
    GET_STAFFS,
    {
      filter: {
        isActive: true,
        ...(role && { accessLevel: role.toUpperCase() as AccessLevel }),
        ...(classId && { classId }),
      },
    },
  );

  const { accessLevel } = await getCurrentUser();

  const title = role ? `${role} Staffs` : "All Staffs";

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
