import { clubsColumn } from "@/components/tables/clubsColumn";
import { getCurrentUser } from "@/lib/server/utils";
import { DataTable } from "@/components/tables/data-table";
import { gql } from "@urql/core";
import {
  GetClubsQuery,
  GetClubsQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";

const GET_CLUBS = gql(`
  query GetClubs($filter: ClubFilter) {
    clubs(filter: $filter) {
      id
      name
      description
      foundedAt
    }
  }
`);

const ClubsListPage = async () => {
  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetClubsQuery, GetClubsQueryVariables>(GET_CLUBS, {})
    .toPromise();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={clubsColumn}
        data={data?.clubs ?? []}
        accessLevel={accessLevel!}
        tableFor="club"
        title="Clubs"
        filters={{ selectCount: false }}
      />
    </div>
  );
};

export default ClubsListPage;
