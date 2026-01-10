import { DataTable } from "@/components/table/column/data-table";
import { studentsColumn } from "@/components/table/column/studentsColumn";
import {
  GetStudentsQuery,
  GetStudentsQueryVariables,
  Student,
  StudentStatus,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { gql } from "@urql/core";
import StudentsStatCard from "@/components/dashboard/cards/StudentsStatCard";
import { SearchParams } from "@/types";
import { ITEMS_PER_PAGE } from "@/lib/settings";

const GET_STUDENTS = gql(`
  query GetStudents($filter: StudentFilter) {
    students(filter: $filter) {
          id
          name
          surname
          registrationNumber
          address
          sex
          img
          status
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

const StudentsList = async ({ searchParams }: SearchParams) => {
  const { status, page } = await searchParams;

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetStudentsQuery, GetStudentsQueryVariables>(GET_STUDENTS, {
      filter: {
        skip: page ? (Number(page) - 1) * ITEMS_PER_PAGE : undefined,
        take: ITEMS_PER_PAGE,
        status: status
          ? status === "inactive"
            ? [
                StudentStatus.Expelled,
                StudentStatus.Withdrawn,
                StudentStatus.Transferred,
              ]
            : [status.toUpperCase() as StudentStatus]
          : undefined,
      },
    })
    .toPromise();

  const { accessLevel } = await getCurrentUser();

  const students = data?.students || [];
  const hasNextPage = students.length > ITEMS_PER_PAGE;

  const filteredData = hasNextPage
    ? students.slice(0, ITEMS_PER_PAGE)
    : students;

  return (
    <div className="m-4 mt-0 flex flex-1 flex-col gap-4">
      <StudentsStatCard students={students as Student[]} />

      <div className="rounded-md bg-white p-4">
        <DataTable
          columns={studentsColumn}
          data={filteredData}
          title={`${status ?? "All"} Students`}
          tableFor="student"
          accessLevel={accessLevel!}
          pagination={{
            page: page ?? 1,
            hasNextPage,
          }}
        />
      </div>
    </div>
  );
};

export default StudentsList;
