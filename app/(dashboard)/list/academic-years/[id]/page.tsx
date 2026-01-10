import { SearchParams } from "@/types";
import { gql } from "@urql/core";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import {
  GetAcademicYearSummaryQuery,
  GetAcademicYearSummaryQueryVariables,
} from "@/lib/generated/graphql/server";
import {
  AttendanceChartContainer,
  FinanceChartContainer,
} from "@/components/dashboard";
import { Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const GET_YEAR_SUMMARY = gql(`
    query GetAcademicYearSummary($id: ID!, $classAttendanceFilter: AttendanceFilter!, $invoicePaymentsFilter: InvoicePaymentFilter!, $payrollTransactionsFilter: PayrollTransactionsFilter!) {
        academicYear(id: $id) {
            id year
        }
        
        classAttendances(filter: $classAttendanceFilter) {
            date status
        }
        
        invoicePayments(filter: $invoicePaymentsFilter) {
            id amountPaid paidAt
        }
        
        payrollTransactions(filter: $payrollTransactionsFilter) {
            id amount paymentDate
        }
    }
`);

const AcademicYearSummaryPage = async ({ params }: SearchParams) => {
  const { id } = await params;

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetAcademicYearSummaryQuery, GetAcademicYearSummaryQueryVariables>(
      GET_YEAR_SUMMARY,
      {
        id,
        classAttendanceFilter: {
          academicYearId: id,
        },
        invoicePaymentsFilter: {
          academicYearId: id,
        },
        payrollTransactionsFilter: {
          academicYearId: id,
        },
      },
    )
    .toPromise();

  const academicYear = data?.academicYear;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="bg-background container mx-auto rounded-lg px-4 py-6 shadow-sm md:py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <h1 className="text-primary flex items-center gap-2 text-lg font-bold tracking-widest uppercase">
              <Calendar className="h-4 w-4" />
              {academicYear?.year} Academic Year Summary
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base">
              Comprehensive overview of the school&apos;s performance, growth
              metrics, and institutional health.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="rounded-full shadow-md">
              <Download className="mr-2 h-4 w-4" />
              Export Annual Report
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        {/* LEFT */}
        <div className="flex w-full flex-col gap-8 lg:w-2/3">
          <div className="h-[450px] w-full lg:w-2/3">
            <AttendanceChartContainer
              data={data?.classAttendances || []}
              range="YEARLY"
              title="Attendance"
            />
          </div>

          <div className="h-[500px] w-full">
            <FinanceChartContainer
              invoicePayments={data?.invoicePayments || []}
              payrollTransactions={data?.payrollTransactions || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicYearSummaryPage;
