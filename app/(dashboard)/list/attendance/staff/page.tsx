import EventCalendar from "@/components/EventCalendar";
import { DataTable } from "@/components/tables/data-table";
import { staffAttendanceColumn } from "@/components/tables/staffAttendanceColumn";
import { GetStaffsAttendanceQuery, GetStaffsAttendanceQueryVariables } from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import type { SearchParams } from "@/types";
import { endOfDay, startOfDay } from "date-fns";
import { gql } from "@urql/core";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";

const GET_STAFFS_ATTENDANCE = gql(`
query GetStaffsAttendance($filter: StaffFilterInput, $attendanceFilter: AttendanceFilter!) {
  staffs(filter: $filter) {
    id
    name
    surname
    attendances(filter: $attendanceFilter) {
      id
      clockInTime
      reasonForAbsence
    }
  }
  }
`)

const StaffAttendanceListPage = async ({ searchParams }: SearchParams) => {
  const { date } = await searchParams;

  const targetDate = date ? new Date(`${date}T08:12:00Z`) : new Date();

  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient()
  const { data } = await client.query<GetStaffsAttendanceQuery, GetStaffsAttendanceQueryVariables>(GET_STAFFS_ATTENDANCE, {
    filter: { isActive: true },
    attendanceFilter: { startDate: start, endDate: end }
  })

  const formattedData = data?.staffs?.map((item) => ({
    ...item,
    date: targetDate,
    attendance: item.attendances[0]
  }));

  return (
    <div className="m-4 mt-0 flex-1 space-y-12 rounded-md bg-white p-4">
      <EventCalendar />

      <DataTable
        columns={staffAttendanceColumn}
        data={formattedData ?? []}
        accessLevel={accessLevel!}
        title={`Attendance Records for ${date ?? "-"}`}
        tableFor="attendance"
        filters={{ selectCount: false }}
      />
    </div>
  );
};

export default StaffAttendanceListPage;
