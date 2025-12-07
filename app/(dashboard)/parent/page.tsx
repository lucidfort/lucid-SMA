import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import EventList from "@/components/EventList";
import { ChildSelector } from "@/components/parent";
import PerformanceChartContainer from "@/components/PerformanceChartContainer";
import { InfoCard } from "@/components/shareable/Card";
import {
  GetParentQuery,
  GetParentQueryVariables,
  GetStudentPerformanceDetailsQuery,
  GetStudentPerformanceDetailsQueryVariables,
  Student,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { calculateAge } from "@/lib/utils";
import { SearchParams } from "@/types";
import { gql } from "@urql/core";
import { format, subDays } from "date-fns";
import { Activity, Cake, GraduationCap } from "lucide-react";

const GET_PARENT = gql(`
  query getParent ($id: ID, $clerkUserId: ID, $attendanceFilter: AttendanceFilter!) {
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
            attendances(filter: $attendanceFilter) {
          date present
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
      attendances(filter: $attendanceFilter) {
        date 
        present
      }
    }
  }
`);

const ParentsOverview = async ({ searchParams }: SearchParams) => {
  const { childId } = await searchParams;
  const { currentUserId } = await getCurrentUser();

  const today = new Date();
  const daysSinceMonday = (today.getDay() / 6) % 7;

  const lastMonday = subDays(today, daysSinceMonday);

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<
    GetParentQuery,
    GetParentQueryVariables
  >(GET_PARENT, {
    clerkUserId: currentUserId, attendanceFilter: {
      startDate: lastMonday
    }
  });

  const { data: studentData } = await client.query<
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

  const attendances = formattedStudent?.attendances || [];
  const presentDays = attendances.filter((day) => day.present).length;
  const attendanceRate = Math.floor((presentDays / 5) * 100);

  const cards = [
    {
      label: "Birthday",
      value: `${format(new Date(formattedStudent.birthday), "MMM d, yyy")} (${calculateAge(formattedStudent.birthday)} years)`,
      icon: Cake,
    },
    {
      label: "Class",
      value: `${formattedStudent?.class?.grade.name} ${formattedStudent.class?.name}`,
      icon: GraduationCap,
    },
    {
      label: "Attendance",
      value: `${attendanceRate || "-"}%`,
      icon: Activity,
    },
  ];

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
                cards={cards}
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
    </div>
  );
};

export default ParentsOverview;
