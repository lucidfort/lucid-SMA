import EventCalendar from "@/components/EventCalendar";
import { attendanceColumn } from "@/components/tables/attendanceColumn";
import { DataTable } from "@/components/tables/data-table";
import { GetClassesAttendanceQuery, GetClassesAttendanceQueryVariables } from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import type { SearchParams } from "@/types";
import { endOfDay, startOfDay } from "date-fns";
import { gql } from "urql";

const GET_CLASSES_ATTENDANCE = gql(`
  query GetClassesAttendance ($attendanceFilter: AttendanceFilter!) {
    classes {
      id
      name
      studentCount
      attendancePresentCount(attendanceFilter: $attendanceFilter)
    }
  }
`)

const ClassAttendanceListPage = async ({ searchParams }: SearchParams) => {
  const { date, classId } = await searchParams;

  const targetDate = date ? new Date(`${date}T08:12:00Z`) : new Date();

  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient()
  const { data } = await client.query<GetClassesAttendanceQuery, GetClassesAttendanceQueryVariables>(GET_CLASSES_ATTENDANCE, { attendanceFilter: { startDate: start, endDate: end, classId } })

  const formattedData = data?.classes?.map((item) => ({
    ...item,
    date,
  }));

  return (
    <div className="m-4 mt-0 flex-1 space-y-12 rounded-md bg-white p-4">
      <EventCalendar />

      <DataTable
        columns={attendanceColumn}
        data={formattedData ?? []}
        accessLevel={accessLevel!}
        title={`Attendance Records for ${date ?? "-"}`}
        tableFor="attendance"
        filters={{ selectCount: false }}
      />
    </div>
  );
};

export default ClassAttendanceListPage;
