import { gql } from "@urql/core";
import { getCurrentUser } from "@/lib/utils/server.utils";
import {
  GetProgramsQuery,
  GetProgramsQueryVariables,
} from "@/lib/generated/graphql/server";
import { DataTable } from "@/components/table/column/data-table";
import { programsColumn } from "@/components/table/column/programsColumn";
import { createUrqlServerClient } from "@/lib/urql/server.client";

const GET_PROGRAMS = gql(`
    query GetPrograms{
        programs {
            id
            name
            isActive
            grades {
                name
                activeStudentsCount
            }
        }
    }
`);

const Page = async () => {
  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetProgramsQuery, GetProgramsQueryVariables>(GET_PROGRAMS, {})
    .toPromise();

  const { accessLevel } = await getCurrentUser();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={programsColumn}
        data={data?.programs ?? []}
        accessLevel={accessLevel!}
        title="Running Programs"
        tableFor="program"
        filters={{ selectCount: false }}
      />
    </div>
  );
};
export default Page;
