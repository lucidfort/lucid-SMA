import { classesColumn } from "@/components/table/column/classesColumn";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { SearchParams } from "@/types";
import { DataTable } from "@/components/table/column/data-table";
import { gql } from "@urql/core";
import {
  GetClassesQuery,
  GetClassesQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/server.client";

const GET_CLASSES = gql(`
  query GetClasses($filter: ClassFilter) {
    classes(filter: $filter) {
      id
      name
      activeStudentsCount
      capacity
      supervisors {
        teacher {
        id
        name 
        surname
        }
      }
      grade {
        id
        name
      }
    }
  }
`);

const ClassesListPage = async ({ searchParams }: SearchParams) => {
  const { supervisorId } = await searchParams;

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<
      GetClassesQuery,
      GetClassesQueryVariables
    >(GET_CLASSES, { filter: { supervisorId } })
    .toPromise();

  const { accessLevel } = await getCurrentUser();

  const formattedData =
    data?.classes?.map((arm) => ({
      ...arm,
      supervisors: arm.supervisors?.map((supervisor) => ({
        ...supervisor.teacher,
      })),
    })) ?? [];

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={classesColumn}
        data={formattedData}
        accessLevel={accessLevel!}
        tableFor="class"
        title="All Classes"
        filters={{ selectCount: false }}
      />
    </div>
  );
};

export default ClassesListPage;
