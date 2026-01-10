import { Announcement } from "@/lib/generated/graphql/server";
import { cn } from "@/lib/utils/client.utils";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import MessageBoard from "@/components/dashboard/MessageBoard";

interface AnnouncementsCardProps {
  announcements: Announcement[];
}
const AnnouncementsCard = ({ announcements }: AnnouncementsCardProps) => {
  const backgrounds = [
    "bg-lamaSkyLight",
    "bg-lamaPurpleLight",
    "bg-lamaYellowLight",
  ];

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
          <MessageBoard
            key={message.id}
            type="announcement"
            title={message.title}
            description={message.content}
            date={new Date(message.publishedAt).toLocaleDateString()}
            triggerClassName="items-start justify-start w-full"
            trigger={
              <div
                className={cn(
                  `w-full cursor-pointer space-y-6 rounded-lg border p-3 transition-opacity hover:opacity-85`,
                  backgrounds[index],
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{message.title}</p>
                  <span className="text-muted-foreground text-xs">
                    {new Date(message.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground line-clamp-3 text-left text-xs">
                  {message.content}
                </p>
              </div>
            }
          />
        ))}

        {announcements.length === 0 && (
          <div className="py-5 text-center text-sm font-light text-gray-600">
            No announcements
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementsCard;
