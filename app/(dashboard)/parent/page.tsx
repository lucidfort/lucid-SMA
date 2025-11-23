import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import { InfoCard } from "@/components/Card";
import ErrorListener from "@/components/ErrorListener";
import { ChildSelector } from "@/components/parent";
import PerformanceChartContainer from "@/components/PerformanceChartContainer";
import {
  GetParentQuery,
  GetParentQueryVariables,
  GetStudentPerformanceDetailsQuery,
  GetStudentPerformanceDetailsQueryVariables,
  Student,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { SearchParams } from "@/types";
import { gql } from "@urql/core";
import { subDays } from "date-fns";
import EventList from "@/components/EventList";

const GET_PARENT = gql(`
  query getParent ($id: ID, $clerkUserId: ID) {
    parent(id: $id, clerkUserId: $clerkUserId) {
      id 
      name 
      surname
      children {
        student {
          id 
          name 
          surname 
          class {
            id 
            name 
            grade {
              id 
              name
            }
          }
        }
      }
    }
  }
`);

const GET_STUDENT_PERFORMANCE = gql(`
  query GetStudentPerformanceDetails ($id: ID!, $attendanceFilter: AttendanceFilter!, $skip: Boolean!) {
    student(id: $id)@skip(if: $skip) {
      id name surname registrationNumber
      img
      birthday 
      attendances(attendanceFilter: $attendanceFilter) {
        date 
        present
      }
    }
  }
`);

const ParentsOverview = async ({ searchParams }: SearchParams) => {
  const { childId } = await searchParams;
  const { currentUserId, schoolId } = await getCurrentUser();

  const today = new Date();
  const daysSinceMonday = (today.getDay() / 6) % 7;

  const lastMonday = subDays(today, daysSinceMonday);

  const { client } = await createUrqlServerClient();
  const { data, error } = await client.query<
    GetParentQuery,
    GetParentQueryVariables
  >(GET_PARENT, { clerkUserId: currentUserId });

  const { data: studentData, error: studentError } = await client.query<
    GetStudentPerformanceDetailsQuery,
    GetStudentPerformanceDetailsQueryVariables
  >(GET_STUDENT_PERFORMANCE, {
    id: childId,
    attendanceFilter: {
      startDate: lastMonday,
    },
    skip: !childId,
  });

  const parent = data?.parent;
  const children =
    (parent?.children?.map((ps) => ps.student) as Student[]) ?? [];

  const selectedStudent = children.find((child) => childId === child.id)?.class;
  const formattedStudent = { ...studentData?.student, class: selectedStudent };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold">
                Welcome back, Mrs. {parent?.surname}
              </h1>
              <p className="text-muted-foreground">
                Monitor your child&apos; progress and stay connected with school
              </p>
            </div>

            <ChildSelector students={children} selectedChild={childId} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row">
        {/* LEFT */}
        {formattedStudent.class && (
          <div className="flex w-full flex-col gap-4 xl:w-2/3">
            <div className="md:flew-row flex w-full flex-col justify-between">
              <InfoCard
                data={formattedStudent}
                table="student"
                accessLevel="parent"
                schoolId={schoolId!}
              />

              <PerformanceChartContainer studentId={childId} />
            </div>

            <AttendanceChartContainer
              data={formattedStudent.attendances ?? []}
            />
          </div>
        )}

        {/* RIGHT */}
        <div className="flex w-full flex-col gap-8 xl:w-1/3">
          <EventList />
          <Announcements />
        </div>
      </div>

      <ErrorListener
        error={error?.graphQLErrors || studentError?.graphQLErrors}
      />
    </div>
  );
};

export default ParentsOverview;
