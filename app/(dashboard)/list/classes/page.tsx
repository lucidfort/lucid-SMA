import { classesColumn } from "@/components/tables/classesColumn";
import { getCurrentUser } from "@/lib/server/utils";
import { SearchParams } from "@/types";
import { DataTable } from "@/components/tables/data-table";
import { gql } from "@urql/core";
import {
  GetClassesQuery,
  GetClassesQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";

const GET_CLASSES = gql(`
  query GetClasses($where: ClassFilterInput) {
    classes(filter: $where) {
      id
      name
      studentCount
      capacity
      supervisors {
        id
        name 
        surname
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

  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<
      GetClassesQuery,
      GetClassesQueryVariables
    >(GET_CLASSES, { where: { supervisorId } })
    .toPromise();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={classesColumn}
        data={data?.classes ?? []}
        accessLevel={accessLevel!}
        tableFor="class"
        title="All Classes"
        filters={{ selectCount: false }}
      />
    </div>
  );
};

export default ClassesListPage;
