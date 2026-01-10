import {
  GetStudentQuery,
  GetStudentQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { SearchParams } from "@/types";
import { subDays } from "date-fns";
import { Activity, GraduationCap } from "lucide-react";
import { gql } from "urql/core";
import {
  AttendanceChartContainer,
  GuardianInfoCard,
  PerformanceChartContainer,
  ShortcutLinks,
  UserInfoCard,
} from "@/components/dashboard";
import { notFound } from "next/navigation";

const GET_STUDENT = gql(`
    query GetStudent($id: ID!, $attendanceFilter: AttendanceFilter!, $resultFilter: ResultFilter!) {
      student(id: $id) {
        id 
        name 
        surname 
        registrationNumber 
        status 
        sex 
        address 
        birthday
        img
        class {
          id 
          name
          grade {
            id
            name
            programId
          }
        }
        guardians {
          isPrimary
          relation
          parent {
            id name surname email phone address
          }
        }
        attendances(filter: $attendanceFilter) {
          date 
          status
        }
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

const StudentDetailsPage = async ({ params }: SearchParams) => {
  const { id } = await params;

  const { accessLevel } = await getCurrentUser();

  const today = new Date();
  const daysSinceMonday = (today.getDay() / 6) % 7;

  const lastMonday = subDays(today, daysSinceMonday);

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<
    GetStudentQuery,
    GetStudentQueryVariables
  >(GET_STUDENT, {
    id,
    attendanceFilter: {
      startDate: lastMonday,
    },
    resultFilter: {
      studentId: id,
    },
  });

  const student = data?.student;
  if (!student) notFound();

  const attendances = student?.attendances || [];
  const presentDays = attendances.filter(
    (day) => day.status === "PRESENT",
  ).length;
  const attendanceRate = Math.floor((presentDays / 5) * 100);

  return (
    <div className="rounded-t-x-2xl flex flex-1 flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="flex w-full flex-col gap-4 xl:w-2/3">
        <UserInfoCard
          table="student"
          data={{ ...student, attendanceRate }}
          cards={[
            {
              label: "Class",
              value: `${student.class.grade.name} ${student.class.name}`,
              icon: GraduationCap,
            },
            {
              label: "Attendance",
              value: `${attendanceRate || "-"}%`,
              icon: Activity,
            },
          ]}
          accessLevel={accessLevel!}
        />

        <div className="flex flex-col justify-between gap-4 lg:flex-row">
          <GuardianInfoCard guardians={student?.guardians || []} />
        </div>

        <div className="h-[450px] w-full">
          <AttendanceChartContainer range="WEEKLY" data={attendances} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full flex-col gap-4 xl:w-1/3">
        <ShortcutLinks
          links={[
            {
              href: `/list/staffs?classId=${student.class.id}`,
              label: "Student's Teachers",
            },
            {
              href: `/list/exams?classId=${student.class.id}`,
              label: "Student's Exams",
            },
            {
              href: `/list/assignments?classId=${student.class.id}`,
              label: "Student's Assignments",
            },
            {
              href: `/list/results?studentId=${student.id}`,
              label: "Student's Results",
            },
            {
              href: `/finance/invoice/pay?studentId=${student.id}`,
              label: "Pay Fees",
            },
          ]}
        />

        <PerformanceChartContainer results={data?.results || []} />
      </div>
    </div>
  );
};

export default StudentDetailsPage;
