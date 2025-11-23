import { InfoCard } from "@/components/Card";
import TimetableBoard from "@/components/TimetableBoard";
import {
  GetStaffQuery,
  GetStaffQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { SearchParams } from "@/types";
import { gql } from "@urql/core";
import Link from "next/link";
import { notFound } from "next/navigation";
import Announcements from "@/components/Announcements";

const GET_STAFF = gql(`
  query GetStaff($id: ID!) {
    staff(id: $id) {
      id
      name
      surname
      role
      phone
      email
      address
      img
      employeeId
      accessLevel
      class {
        id
        name
        grade {
          id
          name
          program {
            id
          }
        }
      }
    }
  }
`);

const TeacherDetailsPage = async ({ params }: SearchParams) => {
  const { id } = await params;
  const { accessLevel, schoolId } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetStaffQuery, GetStaffQueryVariables>(GET_STAFF, { id })
    .toPromise();

  const teacher = data?.staff;

  if (!teacher) return notFound();

  // const smallCards = [
  //   {
  //     value: "90%",
  //     desc: "Attendance",
  //     img: "/singleAttendance.svg",
  //   },
  //   {
  //     value: `${teacher._count.subjects}`,
  //     desc: "Subjects",
  //     img: "/singleBranch.svg",
  //   },
  //   {
  //     value: `${teacher._count.lessons}`,
  //     desc: "Lessons",
  //     img: "/singleLesson.svg",
  //   },
  //   {
  //     value: `${teacher._count.classes}`,
  //     desc: "Classes",
  //     img: "/singleClass.svg",
  //   },
  // ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col gap-4 lg:flex-row">
          <InfoCard
            table="staff"
            data={teacher}
            accessLevel={accessLevel!}
            schoolId={schoolId!}
          />
          {/*<SmallCard cards={smallCards} />*/}
        </div>

        {/* BOTTOM */}
        <div className="mt-4 h-[800px] rounded-md bg-white px-4 py-2">
          <TimetableBoard classId={teacher.class?.id ?? ""} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full flex-col gap-4 xl:w-1/3">
        <div className="rounded-md bg-white p-4">
          <h2 className="text-lg font-semibold">Shortcuts</h2>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
            <Link
              className="rounded-md bg-lamaSkyLight p-3"
              href={`/list/classes?supervisorId=${id}`}
            >
              Teacher&apos;s Classes
            </Link>
            <Link
              className="rounded-md bg-lamaPurpleLight p-3"
              href={`/list/students?teacherId=${id}`}
            >
              Teacher&apos;s Students
            </Link>
            <Link
              className="rounded-md bg-lamaYellowLight p-3"
              href={`/list/lessons?teacherId=${id}`}
            >
              Teacher&apos;s Lessons
            </Link>
            <Link
              className="rounded-md bg-pink-50 p-3"
              href={`/list/exams?teacherId=${id}`}
            >
              Teacher&apos;s Exams
            </Link>
            <Link
              className="rounded-md bg-lamaSkyLight p-3"
              href={`/list/assignments?teacherId=${id}`}
            >
              Teacher&apos;s Assignments
            </Link>
          </div>
        </div>

        <Announcements gradeId={teacher.class?.grade.id} />
      </div>
    </div>
  );
};

export default TeacherDetailsPage;
