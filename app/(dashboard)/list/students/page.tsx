import ErrorListener from "@/components/ErrorListener";
import { DataTable } from "@/components/tables/data-table";
import { studentsColumn } from "@/components/tables/studentsColumn";
import {
  GetStudentsQuery,
  GetStudentsQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { gql } from "@urql/core";

const GET_STUDENTS = gql(`
  query GetStudents {
    students {
      id 
      name 
      surname 
      registrationNumber
      address
      sex
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

const StudentsList = async () => {
  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data, error } = await client
    .query<GetStudentsQuery, GetStudentsQueryVariables>(GET_STUDENTS, {})
    .toPromise();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={studentsColumn}
        data={data?.students ?? []}
        title="Students"
        tableFor="student"
        accessLevel={accessLevel!}
      />

      <ErrorListener error={error?.graphQLErrors} />
    </div>
  );
};

export default StudentsList;
