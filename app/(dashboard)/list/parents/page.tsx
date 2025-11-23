import { DataTable } from "@/components/tables/data-table";
import { parentsColumn } from "@/components/tables/parentsColumn";
import {
  GetParentsQuery,
  GetParentsQueryVariables
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { gql } from "@urql/core";

const GET_PARENTS = gql(`
  query GetParents {
    parents {
      id
        name
        surname
        phone
        primaryId
        email
        address
        childrenCount
    }
  }
`);

const ParentsList = async () => {
  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetParentsQuery, GetParentsQueryVariables>(GET_PARENTS, {})
    .toPromise();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={parentsColumn}
        data={data?.parents ?? []}
        title="Parents"
        tableFor="parent"
        accessLevel={accessLevel!}
      />
    </div>
  );
};

export default ParentsList;
