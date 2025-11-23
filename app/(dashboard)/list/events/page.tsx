import { DataTable } from "@/components/tables/data-table";
import { eventsColumn } from "@/components/tables/eventsColumn";
import { GetEventsQuery, GetEventsQueryVariables } from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { GET_EVENTS } from "@/operations/server/shared";
import { subWeeks } from "date-fns";

const EventsListPage = async () => {
  const { accessLevel } = await getCurrentUser();

  const today = new Date()
  const lastWeek = subWeeks(today, 1)

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<GetEventsQuery, GetEventsQueryVariables>(
    GET_EVENTS,
    {
      filter: { startTime: lastWeek },
      skipGrade: false
    }).toPromise();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={eventsColumn}
        data={data?.events ?? []}
        accessLevel={accessLevel!}
        tableFor="event"
        title="Events"
      />
    </div>
  );
};

export default EventsListPage;
