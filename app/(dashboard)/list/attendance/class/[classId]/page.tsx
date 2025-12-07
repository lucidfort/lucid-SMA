import AttendanceMarker from "@/components/AttendanceMarker";
import { GetClassAttendanceQuery, GetClassAttendanceQueryVariables } from "@/lib/generated/graphql/server";
import { SearchParams } from "@/types";
import { endOfDay, format, startOfDay } from "date-fns";
import { redirect } from "next/navigation";
import { gql } from "@urql/core";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";

const GET_CLASS_ATTENDANCE = gql(`
  query GetClassAttendance($id: ID!, $attendanceFilter: AttendanceFilter!) {
    class(id: $id) {
      id 
      name
      grade {
        id
        name
      }
      attendances(filter: $attendanceFilter) {
        id
        present
        studentId
        updatedAt
      }
      students {
        id
        name
        surname
      }
    }
  }
`)

const ClassAttendanceInfo = async ({ params, searchParams }: SearchParams) => {
  const { classId } = await params;
  const { date } = await searchParams;

  const targetDate = date ? new Date(`${date}T08:12:00Z`) : new Date();

  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const { client } = await createUrqlServerClient()
  const { data } = await client.query<GetClassAttendanceQuery, GetClassAttendanceQueryVariables>(GET_CLASS_ATTENDANCE, { id: classId, attendanceFilter: { startDate: start, endDate: end } })

  if (!data?.class) redirect("/list/attendance/class");

  const lastUpdated = data.class.attendances[0]?.updatedAt;

  return (
    <div className="m-4 mt-0 flex-1 space-y-7 rounded-md bg-white p-4">
      <h1 className="text-center text-lg font-semibold">
        Attendance for {date}
      </h1>
      <div>
        <p className="pr-2 text-right text-sm md:text-base">
          Class: <span>{data.class.grade.name} {data.class.name}</span>
        </p>

        {lastUpdated && (
          <p className="pr-2 text-right text-sm md:text-base">
            Updated: <span>{format(lastUpdated, "PP - p")}</span>
          </p>
        )}
      </div>

      <AttendanceMarker
        classId={classId}
        date={start}
        students={data.class.students}
        attendanceState={data.class.attendances}
      />
    </div>
  );
};
export default ClassAttendanceInfo;
