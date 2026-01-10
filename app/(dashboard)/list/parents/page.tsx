import { DataTable } from "@/components/table/column/data-table";
import { parentsColumn } from "@/components/table/column/parentsColumn";
import {
  GetParentsQuery,
  GetParentsQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { gql } from "@urql/core";
import {
  getRetryAfterSeconds,
  isRateLimitError,
} from "@/lib/utils/client.utils";
import RateLimitNotice from "@/components/RateLimitNotice";

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
      children {
        student {
          id
          name
        }
      }
        childrenCount
    }
  }
`);

const ParentsList = async () => {
  const { client } = await createUrqlServerClient();
  const { data, error } = await client
    .query<GetParentsQuery, GetParentsQueryVariables>(GET_PARENTS, {})
    .toPromise();

  if (error && isRateLimitError(error)) {
    const retryAfter = getRetryAfterSeconds(error) ?? 60;

    return <RateLimitNotice retryAfter={retryAfter} />;
  }

  const { accessLevel } = await getCurrentUser();

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
