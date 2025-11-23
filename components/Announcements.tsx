import {
  GetAnnouncementsQuery,
  GetAnnouncementsQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { cn } from "@/lib/utils";
import { GET_ANNOUNCEMENTS } from "@/operations/server/shared";
import { subDays } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Announcements = async ({ gradeId }: { gradeId?: string }) => {
  const twoWeeksAgo = subDays(new Date(), 10);

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<
    GetAnnouncementsQuery,
    GetAnnouncementsQueryVariables
  >(GET_ANNOUNCEMENTS, {
    filter: { gradeId, rangeFrom: twoWeeksAgo },
    skipGrade: true,
  });

  const announcements = data?.announcements ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Announcements
          <Button
            variant="outline"
            className="ml-auto border-none bg-transparent text-xs"
            size="sm"
          >
            <Link href="/list/announcements">View All</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {announcements.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              `cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/50`,
              {
                "odd:bg-lamaSkyLight": index === 0,
                "odd:bg-lamaPurpleLight": index === 1,
                "odd:bg-lamaYellowLight": index === 2,
              },
            )}
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{message.title}</p>
            </div>
            <p className="mb-2 text-xs text-muted-foreground">
              {message.content}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {new Date(message.publishedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="flex-center h-16 text-sm font-light text-gray-600">
            No announcement found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Announcements;
