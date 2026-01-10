import { getCurrentUser } from "@/lib/utils/server.utils";
import { SearchParams } from "@/types";
import { gradesColumn } from "@/components/table/column/gradesColumn";
import { DataTable } from "@/components/table/column/data-table";
import { gql } from "@urql/core";
import {
  GetGradesQuery,
  GetGradesQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/server.client";

const GET_GRADES = gql(`
    query GetGrades($where: GradeFilter) {
      grades(filter: $where) {
          id
          name
          isActive
          classes {
            id
            name
            activeStudentsCount
          }
      }
    }
`);

const GradesListPage = async ({ searchParams }: SearchParams) => {
  const { supervisorId } = await searchParams;

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<
      GetGradesQuery,
      GetGradesQueryVariables
    >(GET_GRADES, { where: { supervisorId } })
    .toPromise();

  const { accessLevel } = await getCurrentUser();

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
