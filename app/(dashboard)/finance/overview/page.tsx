import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, DollarSign } from "lucide-react";
import FinanceChartContainer from "@/components/dashboard/charts/FinanceChartContainer";
import FeeSummaryCard from "@/components/dashboard/cards/FeeSummaryCard";
import RecentTransactionsCard from "@/components/dashboard/cards/RecentTransactionsCard";
import { gql } from "@urql/core";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import {
  GetFinanceSummaryQuery,
  GetFinanceSummaryQueryVariables,
  InvoicePayment,
} from "@/lib/generated/graphql/server";
import KPICard, {
  type TrendDirection,
} from "@/components/dashboard/cards/KPICard";
import { getYear } from "date-fns";

// Mock data based on Nigerian school context
const kpiData = {
  totalPayments: { value: 1850000, change: 8, trend: "up" },
  outstandingBalance: { value: 450000, change: -5, trend: "down" },
  overdueInvoicePayments: { value: 23, change: -8, trend: "down" },
};

const GET_FINANCE_SUMMARY = gql(`
    query GetFinanceSummary($invoicePaymentFilter: InvoicePaymentFilter!, $invoiceSummaryFilter: InvoiceFilter!, $payrollTransactionsFilter: PayrollTransactionsFilter!) {
        invoicePayments(filter: $invoicePaymentFilter) {
            id
            amountPaid
            students {
                id name surname
            }
            invoice {
                id
                number
            }
            createdAt
            status
        }

        invoices(filter: $invoiceSummaryFilter) {
            id
            title
            paymentCount
            studentCount
        }

        payrollTransactions(filter: $payrollTransactionsFilter) {
            id
            amount
            paymentDate
        }
    }
`);

const DashboardOverview = async () => {
  const { client } = await createUrqlServerClient();
  const { data } = await client.query<
    GetFinanceSummaryQuery,
    GetFinanceSummaryQueryVariables
  >(GET_FINANCE_SUMMARY, {
    invoicePaymentFilter: { take: 5 },
    invoiceSummaryFilter: {},
    payrollTransactionsFilter: {
      year: getYear(new Date()),
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-end">
        <Button variant="outline">Export Report</Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex w-full flex-col gap-8 lg:w-2/3">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <KPICard
              title="Total Payments Received"
              value={kpiData.totalPayments.value}
              change={kpiData.totalPayments.change}
              trend={kpiData.totalPayments.trend as TrendDirection}
              icon={CreditCard}
              format="currency"
            />
            <KPICard
              title="Outstanding Balance"
              value={kpiData.outstandingBalance.value}
              change={kpiData.outstandingBalance.change}
              trend={kpiData.outstandingBalance.trend as TrendDirection}
              icon={DollarSign}
              format="currency"
            />
            <KPICard
              title="Overdue Invoices"
              value={kpiData.overdueInvoicePayments.value}
              change={kpiData.overdueInvoicePayments.change}
              trend={kpiData.overdueInvoicePayments.trend as TrendDirection}
              icon={AlertTriangle}
            />
          </div>

          <div className="h-[500px] w-full">
            <FinanceChartContainer
              invoicePayments={data?.invoicePayments || []}
              payrollTransactions={data?.payrollTransactions || []}
            />
          </div>
        </div>

        <div className="flex w-full flex-col gap-8 lg:w-1/3">
          <RecentTransactionsCard
            transactions={(data?.invoicePayments || []) as InvoicePayment[]}
          />
          <FeeSummaryCard invoices={data?.invoices || []} />

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Financial Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  • 23 invoices are overdue and require immediate attention
                </p>
                <p className="text-sm">
                  • 5 payments failed and need to be reconciled
                </p>
                <p className="text-sm">
                  • Staff salary payments are due in 3 days
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
