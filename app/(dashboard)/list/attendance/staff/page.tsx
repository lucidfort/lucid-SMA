import EventCalendar from "@/components/dashboard/EventCalendar";
import { DataTable } from "@/components/table/column/data-table";
import { staffAttendanceColumn } from "@/components/table/column/staffAttendanceColumn";
import {
  GetStaffsAttendanceQuery,
  GetStaffsAttendanceQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import type { SearchParams } from "@/types";
import { addMonths, endOfDay, endOfMonth, startOfDay } from "date-fns";
import { gql } from "@urql/core";
import { createUrqlServerClient } from "@/lib/urql/server.client";

const GET_STAFFS_ATTENDANCE = gql(`
  query GetStaffsAttendance($filter: StaffFilter, $attendanceFilter: AttendanceFilter!) {
    staffs(filter: $filter) {
      id
      name
      surname
      attendances(filter: $attendanceFilter) {
        id
        clockInTime
        note
      }
    }
  }
`);

const StaffAttendanceListPage = async ({ searchParams }: SearchParams) => {
  const { date, term, tsd, ted } = await searchParams;

  const targetDate = date ? new Date(`${date}T08:12:00Z`) : new Date();

  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<
    GetStaffsAttendanceQuery,
    GetStaffsAttendanceQueryVariables
  >(GET_STAFFS_ATTENDANCE, {
    filter: { isActive: true },
    attendanceFilter: { startDate: start, endDate: end, termId: term },
  });

  const { accessLevel } = await getCurrentUser();

  const formattedData = data?.staffs?.map((item) => ({
    ...item,
    date: targetDate,
    attendance: item.attendances?.[0],
  }));

  const minDate = new Date(tsd);
  const maxDate = ted ? new Date(ted) : addMonths(endOfMonth(minDate), 3);

  return (
    <div className="mt-0 flex w-full flex-col items-center gap-4 p-4 md:flex-row-reverse md:items-start">
      <div className="w-full rounded-md bg-white p-4 md:w-1/3">
        <EventCalendar minDate={minDate} maxDate={maxDate} disableWeekends />
      </div>

      <div className="w-full rounded-md bg-white p-4 md:w-2/3">
        <DataTable
          columns={staffAttendanceColumn}
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

export default StaffAttendanceListPage;
