import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import EventList from "@/components/EventList";
import PerformanceChartContainer from "@/components/PerformanceChartContainer";
import { InfoCard, ParentInfoCard } from "@/components/shareable/Card";
import ShortcutLinks from "@/components/shareable/ShortcutLinks";
import {
  GetStudentQuery,
  GetStudentQueryVariables,
  Parent,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { calculateAge } from "@/lib/utils";
import { SearchParams } from "@/types";
import { format, subDays } from "date-fns";
import { Activity, Cake, GraduationCap, MapPin } from "lucide-react";
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
        attendances(filter: $attendanceFilter) {
          date present
        }
    }
  }
`);

const SingleStudentPage = async ({ params }: SearchParams) => {
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
  });

  const student = data?.student;
  if (!student) return (
    <p>Loading...</p>
  );

  const attendances = student?.attendances || [];
  const presentDays = attendances.filter((day) => day.present).length;
  const attendanceRate = Math.floor((presentDays / 5) * 100);

  const cards = [
    {
      label: "Birthday",
      value: `${format(new Date(student.birthday), "MMM d, yyy")} (${calculateAge(student.birthday)} years)`,
      icon: Cake,
    },
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
    {
      label: "Address",
      value: student.address,
      icon: MapPin,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 xl:flex-row rounded-t-x-2xl">
      {/* LEFT */}
      <div className="flex w-full flex-col gap-4 xl:w-2/3">
        <InfoCard
          table="student"
          data={student}
          cards={cards}
          accessLevel={accessLevel!}
        />

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
          <ShortcutLinks links={[
            { href: `/list/staffs?classId=${student.class.id}`, label: "Student's Teachers" },
            { href: `/list/exams?classId=${student.class.id}`, label: "Student's Exams", className: "bg-pink-50" },
            { href: `/list/assignments?classId=${student.class.id}`, label: "Student's Assignments", className: "bg-lamaSkyLight" },
            { href: `/list/results?studentId=${student.id}`, label: "Student's Results", className: "bg-lamaYellowLight" },
            { href: `/list/fees/pay?studentId=${student.id}`, label: "Pay Fees" },
          ]} />
        </div>

        <PerformanceChartContainer studentId={id} />

        <EventList gradeId={student.class.grade.id} />
        <Announcements gradeId={student.class.grade.id} />
      </div>
    </div>
  );
};

export default SingleStudentPage;
