import { subjectsColumn } from "@/components/table/column/subjectsColumn";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { DataTable } from "@/components/table/column/data-table";
import { gql } from "@urql/core";
import {
  GetSubjectsQuery,
  GetSubjectsQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/server.client";

const GET_SUBJECTS = gql(`
    query GetSubjects{
        subjects {
            id
            name
            teachers {
              id
              teacher {
                id
                  name 
                  surname
              }
            }
        }
    }
`);

const SubjectsListPage = async () => {
  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetSubjectsQuery, GetSubjectsQueryVariables>(GET_SUBJECTS, {})
    .toPromise();

  const { accessLevel } = await getCurrentUser();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={subjectsColumn}
        data={data?.subjects ?? []}
        accessLevel={accessLevel!}
        title="Subjects"
        tableFor="subject"
        filters={{ selectCount: false }}
      />
    </div>
  );
};

export default SubjectsListPage;
