import { announcementsColumn } from "@/components/table/column/announcementsColumn";
import { DataTable } from "@/components/table/column/data-table";
import {
  GetAnnouncementsQuery,
  GetAnnouncementsQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { gql } from "@urql/core";
import { SearchParams } from "@/types";

const GET_ANNOUNCEMENTS = gql(`
  query GetAnnouncements($filter: AnnouncementFilter!, $take: Int) {
    announcements(filter: $filter, take: $take) {
      id
      content
      title
      publishedAt
      grade {
        id
        name
      }
    }
  }
`);

const AnnouncementsListPage = async ({ searchParams }: SearchParams) => {
  const { term } = await searchParams;

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetAnnouncementsQuery, GetAnnouncementsQueryVariables>(
      GET_ANNOUNCEMENTS,
      {
        filter: {
          termId: term,
        },
      },
    )
    .toPromise();

  const { accessLevel } = await getCurrentUser();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        accessLevel={accessLevel!}
        columns={announcementsColumn}
        data={data?.announcements ?? []}
        tableFor="announcement"
        title="Announcements"
        filters={{
          selectCount: accessLevel === "manager",
          termFilter: true,
        }}
      />
    </div>
  );
};

export default AnnouncementsListPage;
