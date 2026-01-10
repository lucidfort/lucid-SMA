import {
  GetParentQuery,
  GetParentQueryVariables,
  Student,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { SearchParams } from "@/types";
import { gql } from "@urql/core";
import { startOfDay, subDays } from "date-fns";
import {
  AnnouncementsCard,
  AttendanceChartContainer,
  PerformanceChartContainer,
  UpcomingEventsCard,
} from "@/components/dashboard";
import { ChildSelector } from "@/components/parent";

const GET_PARENT = gql(`
  query getParent ($id: ID, $clerkUserId: ID, $eventsFilter: EventFilter!, $announcementsFilter: AnnouncementFilter!, $resultFilter: ResultFilter!, $attendanceFilter: AttendanceFilter!) {
    parent(id: $id, clerkUserId: $clerkUserId) {
      id 
      name 
      surname
      children {
        student {
          id 
          name 
          surname
          attendances(filter: $attendanceFilter) {
            date
            status
          }
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

    results(filter: $resultFilter) {
      ... on AssessmentResult {
        id
        score
        assignment {
          maxScore
        }
      }

      ...on ExamResult {
        id
        score
        exam {
          maxScore
        }
      }
    }
  }
`);

const ParentsOverview = async ({ searchParams }: SearchParams) => {
  const { child } = await searchParams;
  const { currentUserId } = await getCurrentUser();

  const today = new Date();
  const daysSinceMonday = (today.getDay() / 6) % 7;

  const lastMonday = subDays(today, daysSinceMonday);

  const { client } = await createUrqlServerClient();
  const { data: parentData } = await client
    .query<GetParentQuery, GetParentQueryVariables>(GET_PARENT, {
      clerkUserId: currentUserId,
      eventsFilter: {
        date: startOfDay(new Date()),
        take: 3,
      },
      announcementsFilter: {
        rangeFrom: subDays(new Date(), 10),
        take: 3,
      },
      resultFilter: {
        studentId: child,
      },
      attendanceFilter: {
        startDate: lastMonday,
      },
    })
    .toPromise();

  const parent = parentData?.parent;
  const children =
    (parent?.children?.map((ps) => ps.student) as Student[]) ?? [];

  const attendances = children.flatMap((c) => c.attendances || []);

  return (
    <div className="flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="flex w-full flex-col gap-4 xl:w-2/3">
        <div className="bg-background border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="mb-2 text-2xl font-bold">
                  Welcome back, Mrs. {parent?.surname}
                </h1>
                <p className="text-muted-foreground">
                  Monitor your child&apos; progress and stay connected with
                  school
                </p>
              </div>

              <ChildSelector students={children} />
            </div>
          </div>
        </div>

        <div className="h-[450px] w-full">
          <AttendanceChartContainer range="WEEKLY" data={attendances || []} />
        </div>

        <PerformanceChartContainer results={parentData?.results || []} />
      </div>

      {/* RIGHT */}
      <div className="flex w-full flex-col gap-8 xl:w-1/3">
        <UpcomingEventsCard events={parentData?.events || []} />
        <AnnouncementsCard announcements={parentData?.announcements || []} />
      </div>
    </div>
  );
};

export default ParentsOverview;
