import { announcementsColumn } from "@/components/tables/announcementsColumn";
import { DataTable } from "@/components/tables/data-table";
import { GetAnnouncementsQuery, GetAnnouncementsQueryVariables } from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { GET_ANNOUNCEMENTS } from "@/operations/server/shared";

const AnnouncementsListPage = async () => {
  const { client } = await createUrqlServerClient()
  const { data } = await client.query<GetAnnouncementsQuery, GetAnnouncementsQueryVariables>(
    GET_ANNOUNCEMENTS,
    {
      filter: {},
      skipGrade: false
    })

  const { accessLevel } = await getCurrentUser();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        accessLevel={accessLevel!}
        columns={announcementsColumn}
        data={data?.announcements ?? []}
        tableFor="announcement"
        title="Recent Announcements"
      />
    </div>
  );
};

export default AnnouncementsListPage;
