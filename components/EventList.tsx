import {
  GetEventsQuery,
  GetEventsQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { GET_EVENTS } from "@/operations/server/shared";
import { startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EventListProps {
  gradeId?: string;
}

const EventList = async ({ gradeId }: EventListProps) => {
  const start = startOfDay(new Date());

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<GetEventsQuery, GetEventsQueryVariables>(
    GET_EVENTS,
    {
      filter: { startTime: start, gradeId },
      skipGrade: true,
    },
  );

  const upcomingEvents = data?.events ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events
          <Button
            variant="outline"
            className="ml-auto border-none bg-transparent text-xs"
            size="sm"
          >
            <Link href="/list/events">View All</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10">
              <p className="text-xs font-medium text-primary">
                {new Date(event.startTime).toLocaleDateString("en-US", {
                  month: "short",
                })}
              </p>
              <p className="text-lg font-bold text-primary">
                {new Date(event.startTime).getDate()}
              </p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{event.title}</p>
              <div className="mt-1 flex items-center gap-2">
                {event.description && (
                  <span className="text-xs text-muted-foreground">
                    {event.description}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {upcomingEvents.length === 0 && (
          <div className="flex-center h-16 text-sm font-light text-gray-600">
            There are no upcoming events
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <Button variant="outline" className="w-full bg-transparent" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Sync to Calendar
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EventList;
