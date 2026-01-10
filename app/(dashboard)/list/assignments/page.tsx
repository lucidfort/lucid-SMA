import { assignmentsColumn } from "@/components/table/column/assignmentsColumn";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { gql } from "@urql/core";
import { DataTable } from "@/components/table/column/data-table";
import {
  GetAssignmentsQuery,
  GetAssignmentsQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { SearchParams } from "@/types";

const GET_ASSIGNMENTS = gql(`
  query GetAssignments($filter: AssignmentFilter!) {
    assignments(filter: $filter) {
      id
      dueDate
      maxScore
      class {
        id 
        name 
        grade {
          id
           name
        }
      }
      subject {
        id 
        name
      }
    }
  }
`);

const AssignmentsListPage = async ({ searchParams }: SearchParams) => {
  const { term } = await searchParams;

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetAssignmentsQuery, GetAssignmentsQueryVariables>(GET_ASSIGNMENTS, {
      filter: {
        termId: term,
      },
    })
    .toPromise();

  const { accessLevel } = await getCurrentUser();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={assignmentsColumn}
        data={data?.assignments ?? []}
        accessLevel={accessLevel!}
        tableFor="assignment"
        title="Assignments"
        filters={{ selectCount: false, termFilter: true }}
      />
    </div>
  );
};

export default AssignmentsListPage;
