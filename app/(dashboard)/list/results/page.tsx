import { DataTable } from "@/components/tables/data-table";
import { resultsColumn } from "@/components/tables/resultsColumn";
import {
  GetResultsQuery,
  GetResultsQueryVariables
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { gql } from "@urql/core";

const GET_RESULTS = gql(`
  query GetResults($filter: ResultFilter!) {
    results(filter: $filter) {
      id
      uploadedAt
    }
  }
`);

const ResultsListPage = async () => {
  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient();

  const { data } = await client
    .query<
      GetResultsQuery,
      GetResultsQueryVariables
    >(GET_RESULTS, { filter: {} })
    .toPromise();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={resultsColumn}
        data={data?.results ?? []}
        accessLevel={accessLevel!}
        tableFor="result"
        title="Results"
        filters={{ selectCount: false }}
      />
    </div>
  );
};

export default ResultsListPage;
