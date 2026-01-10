import EventCalendar from "@/components/dashboard/EventCalendar";
import { attendanceColumn } from "@/components/table/column/attendanceColumn";
import { DataTable } from "@/components/table/column/data-table";
import {
  GetClassesAttendanceQuery,
  GetClassesAttendanceQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
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
      activeStudentsCount
      attendancePresentCount(filter: $attendanceFilter)
    }
  }
`);

const ClassAttendanceListPage = async ({ searchParams }: SearchParams) => {
  const { date, classId, term, tsd, ted } = await searchParams;

  const targetDate = date ? new Date(`${date}T08:12:00Z`) : new Date();

  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<
    GetClassesAttendanceQuery,
    GetClassesAttendanceQueryVariables
  >(GET_CLASSES_ATTENDANCE, {
    attendanceFilter: { startDate: start, endDate: end, classId, termId: term },
  });

  const { accessLevel } = await getCurrentUser();

  const formattedData = data?.classes?.map((item) => ({
    ...item,
    date,
  }));

  return (
    <div className="mt-0 flex w-full flex-col items-center gap-4 p-4 md:flex-row-reverse md:items-start">
      <div className="w-full rounded-md bg-white p-4 md:w-1/3">
        <EventCalendar
          minDate={new Date(tsd)}
          maxDate={new Date(ted)}
          disableWeekends
        />
      </div>

      <div className="w-full rounded-md bg-white p-4 md:w-2/3">
        <DataTable
          columns={attendanceColumn}
          data={formattedData ?? []}
          accessLevel={accessLevel!}
          title={`Attendance Records for ${date ?? new Date().toLocaleDateString("en-CA")}`}
          tableFor="attendance"
          filters={{ selectCount: false, termFilter: true, sortFilter: false }}
        />
      </div>
    </div>
  );
};

export default ClassAttendanceListPage;
