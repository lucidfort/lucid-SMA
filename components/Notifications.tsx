import { GetAnnouncementsCountQuery, GetAnnouncementsCountQueryVariables } from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { gql } from "@urql/core";
import { subDays } from "date-fns";

const GET_NOTIFICATION_COUNT = gql(`
  query GetAnnouncementsCount($id: ID!, $rangeFrom: DateTime!) {
    school(id: $id ) {
      id
      announcementsCount(rangeFrom: $rangeFrom)
    }
  }`)

const Notifications = async ({ schoolId }: { schoolId: string }) => {
  const sevenDaysAgo = subDays(new Date(), 7)

  const { client } = await createUrqlServerClient()
  const { data } = await client.query<GetAnnouncementsCountQuery, GetAnnouncementsCountQueryVariables>(
    GET_NOTIFICATION_COUNT,
    {
      id: schoolId, rangeFrom: sevenDaysAgo
    })

  return (
    <div className="absolute -top-3 -right-3 flex-center h-5 w-5 rounded-full bg-purple-500 text-xs text-white">
      {data?.school?.announcementsCount}
    </div>
  );
};

export default Notifications;
