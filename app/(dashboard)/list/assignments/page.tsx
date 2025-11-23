import { assignmentsColumn } from "@/components/tables/assignmentsColumn";
import { getCurrentUser } from "@/lib/server/utils";
import { gql } from "@urql/core";
import { DataTable } from "@/components/tables/data-table";
import {
  GetAssignmentsQuery,
  GetAssignmentsQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";

const GET_ASSIGNMENTS = gql(`
  query GetAssignments($filter: AssignmentFilter) {
    assignments(filter: $filter) {
      id
      startDate
      dueDate
      maxScore
      term {
        id term
      }
      class {
        id 
        name 
        grade {
          id
           name
        }
      }
      subject {
        id name
      }
    }
  }
`);

const AssignmentsListPage = async () => {
  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient();

  const { data } = await client
    .query<
      GetAssignmentsQuery,
      GetAssignmentsQueryVariables
    >(GET_ASSIGNMENTS, {})
    .toPromise();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={assignmentsColumn}
        data={data?.assignments ?? []}
        accessLevel={accessLevel!}
        tableFor="assignment"
        title="Assignments"
        filters={{ selectCount: false }}
      />
    </div>
  );
};

export default AssignmentsListPage;
