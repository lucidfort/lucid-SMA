import { DataTable } from "@/components/table/column/data-table";
import { eventsColumn } from "@/components/table/column/eventsColumn";
import {
  GetEventsQuery,
  GetEventsQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { subWeeks } from "date-fns";
import { gql } from "@urql/core";
import EventCalendar from "@/components/dashboard/EventCalendar";
import { SearchParams } from "@/types";

const GET_EVENTS = gql(`
  query GetEvents($filter: EventFilter!) {
    events(filter: $filter) {
      id
      title
      description
      date
      updatedAt
      grade {
        id
        name
      }
    }
  }
`);

const EventsListPage = async ({ searchParams }: SearchParams) => {
  const { date } = await searchParams;

  const targetDate = date
    ? new Date(`${date}T08:12:00Z`)
    : subWeeks(new Date(), 1);

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetEventsQuery, GetEventsQueryVariables>(GET_EVENTS, {
      filter: { date: targetDate },
    })
    .toPromise();

  const { accessLevel } = await getCurrentUser();

  return (
    <div className="m-4 mt-0 flex w-full flex-col gap-4 xl:flex-row-reverse">
      <div className="w-full xl:w-1/3">
        <EventCalendar />
      </div>

      <div className="flex-1 rounded-md bg-white p-4">
        <DataTable
          columns={eventsColumn}
          data={data?.events ?? []}
          accessLevel={accessLevel!}
          tableFor="event"
          title="Events"
          filters={{
            selectCount: accessLevel === "manager",
          }}
        />
      </div>
    </div>
  );
};

export default EventsListPage;
