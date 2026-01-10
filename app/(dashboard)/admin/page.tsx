import {
  AnnouncementsCard,
  AttendanceChartContainer,
  CountChartContainer,
  FeeSummaryCard,
  FinanceChartContainer,
  UpcomingEventsCard,
  UserCard,
} from "@/components/dashboard";
import RateLimitNotice from "@/components/RateLimitNotice";
import {
  GetAdminDashboardDataQuery,
  GetAdminDashboardDataQueryVariables,
  PaymentStatus,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { gql } from "@urql/core";
import {
  endOfYear,
  getYear,
  startOfDay,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns";
import {
  getRetryAfterSeconds,
  isRateLimitError,
} from "@/lib/utils/client.utils";

const GET_DASHBOARD_DATA = gql(`
  query GetAdminDashboardData(
    $schoolId: ID!, 
    $attendanceFilter: AttendanceFilter!, 
    $invoicePaymentFilter: InvoicePaymentFilter!, 
    $payrollTransactionsFilter: PayrollTransactionsFilter!, 
    $eventsFilter: EventFilter!, 
    $announcementsFilter: AnnouncementFilter!, 
    $invoiceSummaryFilter: InvoiceFilter!
  ) {
    school(id: $schoolId) {
      id
      activeStaffCount
      activeStudentsCount
      studentSexDistribution {
        sex
        _count
      }
    }

    classAttendances(filter: $attendanceFilter) {
      date
      status
    }

    invoicePayments(filter: $invoicePaymentFilter) {
      id
      amountPaid
      paidAt
    }

    payrollTransactions(filter: $payrollTransactionsFilter) {
      id
      amount
      paymentDate
    }
    
    events(filter: $eventsFilter) {
      id
      title
      description
      date
    }
    
    announcements(filter: $announcementsFilter) {
      id
      content
      title
      publishedAt
    }

    invoices(filter: $invoiceSummaryFilter) {
      id
      title
      paymentCount
      studentCount
    }
  }
`);

const AdminPage = async () => {
  const { schoolId } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data, error } = await client.query<
    GetAdminDashboardDataQuery,
    GetAdminDashboardDataQueryVariables
  >(GET_DASHBOARD_DATA, {
    schoolId: schoolId!,
    attendanceFilter: {
      startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
    },
    invoicePaymentFilter: {
      startDate: startOfYear(new Date()),
      endDate: endOfYear(new Date()),
      status: PaymentStatus.Success,
    },
    eventsFilter: {
      date: startOfDay(new Date()),
      take: 3,
    },
    announcementsFilter: {
      rangeFrom: subDays(new Date(), 10),
      take: 3,
    },
    invoiceSummaryFilter: {},
    payrollTransactionsFilter: {
      year: getYear(new Date()),
    },
  });

  if (error && isRateLimitError(error)) {
    const retryAfter = getRetryAfterSeconds(error) ?? 60;

    return <RateLimitNotice retryAfter={retryAfter} />;
  }

  const school = data?.school;

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {/* LEFT */}
      <div className="flex w-full flex-col gap-8 lg:w-2/3">
        <div className="grid grid-cols-2 gap-4">
          <UserCard label="Staffs" value={school?.activeStaffCount} />
          <UserCard label="Students" value={school?.activeStudentsCount} />
        </div>

        <div className="flex w-full flex-col gap-4 lg:flex-row">
          <div className="h-[450px] w-full lg:w-1/3">
            <CountChartContainer data={school?.studentSexDistribution || []} />
          </div>

          <div className="h-[450px] w-full lg:w-2/3">
            <AttendanceChartContainer data={data?.classAttendances || []} />
          </div>
        </div>

        <div className="h-[500px] w-full">
          <FinanceChartContainer
            invoicePayments={data?.invoicePayments || []}
            payrollTransactions={data?.payrollTransactions || []}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full flex-col gap-8 lg:w-1/3">
        <UpcomingEventsCard events={data?.events || []} />
        <AnnouncementsCard announcements={data?.announcements || []} />
        <FeeSummaryCard invoices={data?.invoices || []} />
      </div>
    </div>
  );
};

export default AdminPage;
