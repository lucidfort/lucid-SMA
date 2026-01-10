import AnnouncementsCard from "@/components/dashboard/cards/AnnouncementsCard";
import TimetableBoard from "@/components/dashboard/TimetableBoard";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { gql } from "@urql/core";
import UpcomingEventsCard from "@/components/dashboard/cards/UpcomingEventsCard";
import {
  GetStaffDetailsQuery,
  GetStaffDetailsQueryVariables,
} from "@/lib/generated/graphql/server";
import { notFound } from "next/navigation";
import { startOfDay, subDays } from "date-fns";

const GET_STAFF = gql(`
  query GetStaffDetails($id: ID, $clerkUserId: String, $eventsFilter: EventFilter!, $announcementsFilter: AnnouncementFilter!) {
    staff(id: $id, clerkUserId: $clerkUserId) {
      id
      assignedClass {
        class {
        id 
          name
        }
      }
    }

    events(filter: $eventsFilter) {
      id
      title
      description
      date
    }

    announcements(filter: $announcementsFilter) {
      id
      content
      title
      publishedAt
    }
  }
`);

const TeacherPage = async () => {
  const { currentUserId } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<
    GetStaffDetailsQuery,
    GetStaffDetailsQueryVariables
  >(GET_STAFF, {
    clerkUserId: currentUserId,
    eventsFilter: {
      date: startOfDay(new Date()),
      take: 3,
    },
    announcementsFilter: {
      rangeFrom: subDays(new Date(), 10),
      take: 3,
    },
  });

  const teacher = data?.staff;

  if (!teacher) notFound();

  const classId = teacher.assignedClass?.[0].class.id || "";

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full rounded-md bg-white p-4">
          <h1 className="text-xl font-semibold">Schedule</h1>
          <TimetableBoard classId={classId} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full flex-col gap-8 xl:w-1/3">
        <UpcomingEventsCard events={data?.events || []} />
        <AnnouncementsCard announcements={data?.announcements || []} />
      </div>
    </div>
  );
};

export default TeacherPage;
