import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import MessageBoard from "@/components/dashboard/MessageBoard";
import { Event } from "@/lib/generated/graphql/server";

interface Props {
  events: Event[];
}

const UpcomingEventsCard = ({ events }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events
          {events.length > 0 && (
            <Button
              variant="outline"
              className="ml-auto border-none bg-transparent text-xs"
              size="sm"
            >
              <Link href="/list/events">View All</Link>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <MessageBoard
            key={event.id}
            type="event"
            title={event.title}
            description={event?.description || ""}
            date={new Date(event.date).toLocaleDateString()}
            triggerClassName={"text-left"}
            trigger={
              <div
                key={event.id}
                className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-3 transition-colors"
              >
                <div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg">
                  <p className="text-primary text-xs font-medium">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </p>
                  <p className="text-primary text-lg font-bold">
                    {new Date(event.date).getDate()}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    {event.description && (
                      <span className="text-muted-foreground text-xs">
                        {event.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            }
          />
        ))}

        {events.length === 0 && (
          <div className="py-5 text-center text-sm font-light text-gray-600">
            There are no upcoming events
          </div>
        )}

        {events.length > 0 && (
          <Button variant="outline" className="w-full bg-transparent" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Sync to Calendar
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsCard;
