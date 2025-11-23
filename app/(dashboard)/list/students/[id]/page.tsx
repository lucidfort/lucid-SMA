import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import { InfoCard, ParentInfoCard, SmallCard } from "@/components/Card";
import ErrorListener from "@/components/ErrorListener";
import PerformanceChartContainer from "@/components/PerformanceChartContainer";
import {
  GetStudentQuery,
  GetStudentQueryVariables,
  Parent,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { SearchParams } from "@/types";
import { subDays } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { gql } from "urql/core";

const GET_STUDENT = gql(`
    query GetStudent($id: ID!, $attendanceFilter: AttendanceFilter!) {
      student(id: $id) {
        id 
        name 
        surname 
        registrationNumber 
        activeState 
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
        attendances(attendanceFilter: $attendanceFilter) {
          date present
        }
    }
  }
`);

const SingleStudentPage = async ({ params }: SearchParams) => {
  const { id } = await params;
  const { accessLevel, schoolId } = await getCurrentUser();

  const today = new Date();
  const daysSinceMonday = (today.getDay() / 6) % 7;

  const lastMonday = subDays(today, daysSinceMonday);

  const { client } = await createUrqlServerClient();
  const { data, error } = await client.query<
    GetStudentQuery,
    GetStudentQueryVariables
  >(GET_STUDENT, {
    id,
    attendanceFilter: {
      startDate: lastMonday,
    },
    // skipAttendance:
  });

  const student = data?.student;
  if (!student) return notFound();

  const attendances = student?.attendances || [];
  const presentDays = attendances.filter((day) => day.present).length;
  const percentage = Math.floor((presentDays / 5) * 100);

  const cards = [
    {
      value: `${percentage || "-"}%`,
      desc: "Attendance",
      img: "/singleAttendance.svg",
    },
    {
      value: `${student.class.grade.name}`,
      desc: "Grade",
      img: "/singleBranch.svg",
    },
    {
      value: student.class.name,
      desc: "Class",
      img: "/singleClass.svg",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 xl:flex-row">
      {/* LEFT */}
      <div className="flex w-full flex-col gap-4 xl:w-2/3">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <InfoCard
            table="student"
            data={student}
            accessLevel={accessLevel!}
            schoolId={schoolId!}
          />
          <SmallCard cards={cards} />
        </div>

        <div className="flex flex-col justify-between gap-4 lg:flex-row">
          {student.guardians &&
            student.guardians.length > 0 &&
            student.guardians.map((guardian) => (
              <ParentInfoCard
                key={guardian.parent.id}
                parent={guardian.parent as Parent}
                relation={guardian.relation}
              />
            ))}
        </div>

        <div className="h-[450px] w-full">
          <AttendanceChartContainer data={attendances} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full flex-col gap-4 xl:w-1/3">
        <div className="rounded-md bg-white p-4">
          <h2 className="text-lg font-semibold">Shortcuts</h2>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
            <Link
              className="rounded-md bg-lamaPurpleLight p-3"
              href={`/list/teachers?classId=${student.class.id}`}
            >
              Student&apos;s Teachers
            </Link>
            <Link
              className="rounded-md bg-pink-50 p-3"
              href={`/list/exams?classId=${student.class.id}`}
            >
              Student&apos;s Exams
            </Link>
            <Link
              className="rounded-md bg-lamaSkyLight p-3"
              href={`/list/assignments?classId=${student.class.id}`}
            >
              Student&apos;s Assignments
            </Link>
            <Link
              className="rounded-md bg-lamaYellowLight p-3"
              href={`/list/results?studentId=${id}`}
            >
              Student&apos;s Results
            </Link>

            <Link
              className="rounded-md bg-lamaYellowLight p-3"
              href={`/list/fees/pay?studentId=${id}`}
            >
              Pay Fees
            </Link>
          </div>
        </div>

        <PerformanceChartContainer studentId={id} />

        <Announcements gradeId={student.class.grade.id} />
      </div>

      <ErrorListener error={error?.graphQLErrors} />
    </div>
  );
};

export default SingleStudentPage;
