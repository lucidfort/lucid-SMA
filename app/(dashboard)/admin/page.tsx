import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventList from "@/components/EventList";
import FeeSummary from "@/components/FeeSummary";
import FinanceChartContainer from "@/components/FinanceChartContainer";
import UserCard from "@/components/UserCard";
import {
  GetSchoolDetailsQuery,
  GetSchoolDetailsQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { gql } from "@urql/core";
import { startOfWeek } from "date-fns";

const GET_SCHOOL_DETAILS = gql(`
  query GetSchoolDetails($id: ID!, $attendanceFilter: AttendanceFilter!) {
    school(id: $id) {
      id
      activeStaffCount
      activeStudentsCount
      studentSexDistribution {
        sex
        _count
      }
      studentAttendances(filter: $attendanceFilter) {
        date present
      }
    }
  }
`);

const AdminPage = async () => {
  const { schoolId } = await getCurrentUser();

  const today = new Date();
  const lastMonday = startOfWeek(today, { weekStartsOn: 1 });

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<
    GetSchoolDetailsQuery,
    GetSchoolDetailsQueryVariables
  >(GET_SCHOOL_DETAILS, {
    id: schoolId!,
    attendanceFilter: { startDate: lastMonday },
  });

  const school = data?.school;

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {/* LEFT */}
      <div className="flex w-full flex-col gap-8 lg:w-2/3">
        <div className="grid grid-cols-2 gap-4">
          <UserCard label="Staffs" value={school?.activeStaffCount} />
          <UserCard label="Students" value={school?.activeStudentsCount} />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="h-[450px] w-full lg:w-1/3">
            <CountChartContainer data={school?.studentSexDistribution ?? []} />
          </div>

          <div className="h-[450px] w-full lg:w-2/3">
            <AttendanceChartContainer data={school?.studentAttendances ?? []} />
          </div>
        </div>

        <div className="h-[500px] w-full">
          <FinanceChartContainer />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full flex-col gap-8 lg:w-1/3">
        <EventList />
        <Announcements />
        <FeeSummary />
      </div>
    </div>
  );
};

export default AdminPage;
