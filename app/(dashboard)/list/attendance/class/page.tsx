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
      grade {
        id 
        name
      }
      studentCount
      attendancePresentCount(filter: $attendanceFilter)
    }
  }
`)

const ClassAttendanceListPage = async ({ searchParams }: SearchParams) => {
  const { date, classId, term, tsd, ted } = await searchParams;

  const targetDate = date ? new Date(`${date}T08:12:00Z`) : new Date();

  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient()
  const { data } = await client.query<GetClassesAttendanceQuery, GetClassesAttendanceQueryVariables>(GET_CLASSES_ATTENDANCE, { attendanceFilter: { startDate: start, endDate: end, classId, termId: term } })

  const formattedData = data?.classes?.map((item) => ({
    ...item,
    date,
  }));

  return (
    <div className="mt-0 w-full p-4 flex flex-col gap-4 items-center md:items-start md:flex-row-reverse">
      <div className="bg-white rounded-md w-full p-4 md:w-1/3">
        <EventCalendar
          minDate={new Date(tsd)}
          maxDate={new Date(ted)}
          disableWeekends
        />
      </div>

      <div className="bg-white rounded-md w-full p-4 md:w-2/3">
        <DataTable
          columns={attendanceColumn}
          data={formattedData ?? []}
          accessLevel={accessLevel!}
          title={`Attendance Records for ${date ?? "-"}`}
          tableFor="attendance"
          filters={{ selectCount: false, termFilter: true, sortFilter: false }}
        />
      </div>
    </div>
  );
};

export default ClassAttendanceListPage;
