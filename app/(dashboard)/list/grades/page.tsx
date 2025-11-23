import { getCurrentUser } from "@/lib/server/utils";
import { SearchParams } from "@/types";
import { gradesColumn } from "@/components/tables/gradesColumn";
import { DataTable } from "@/components/tables/data-table";
import { gql } from "@urql/core";
import {
  GetGradesQuery,
  GetGradesQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";

const GET_GRADES = gql(`
    query GetGrades($where: GradeFilterInput) {
      grades(filter: $where) {
          id
          name
          classes {
            id
            name
            studentCount
          }
      }
    }
`);

const GradesListPage = async ({ searchParams }: SearchParams) => {
  const { supervisorId } = await searchParams;

  const { accessLevel } = await getCurrentUser();
  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<
      GetGradesQuery,
      GetGradesQueryVariables
    >(GET_GRADES, { where: { supervisorId } })
    .toPromise();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={gradesColumn}
        data={data?.grades ?? []}
        accessLevel={accessLevel!}
        title="All Grades"
        tableFor="grade"
      />
    </div>
  );
};

export default GradesListPage;
