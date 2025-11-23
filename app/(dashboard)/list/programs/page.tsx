import { gql } from "@urql/core";
import { getCurrentUser } from "@/lib/server/utils";
import {
  GetProgramsQuery,
  GetProgramsQueryVariables,
} from "@/lib/generated/graphql/server";
import { DataTable } from "@/components/tables/data-table";
import { programsColumn } from "@/components/tables/programsColumn";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";

const GET_PROGRAMS = gql(`
    query GetPrograms{
        programs {
            id
            name
            grades {
                name
                studentCount
            }
        }
    }
`);

const Page = async () => {
  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetProgramsQuery, GetProgramsQueryVariables>(GET_PROGRAMS, {})
    .toPromise();

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
