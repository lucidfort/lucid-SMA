import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GetInvoiceSummaryQuery,
  GetInvoiceSummaryQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { gql } from "@urql/core";
import { ReceiptEuro } from "lucide-react";

interface FeeSummaryProps {
  feeId?: string;

  // Specific fees
  classId?: string;
  gradeId?: string;
}

const GET_INVOICE_SUMMARY = gql(`
  query GetInvoiceSummary($filter: InvoiceFilter!) {
    invoices(filter: $filter) {
      id
      title
      paymentCount
      studentCount
    }
  }
`);

const FeeSummary = async ({ feeId, classId, gradeId }: FeeSummaryProps) => {
  const { client } = await createUrqlServerClient();
  const { data } = await client.query<
    GetInvoiceSummaryQuery,
    GetInvoiceSummaryQueryVariables
  >(GET_INVOICE_SUMMARY, {
    filter: {
      invoiceId: feeId,
      classId,
      gradeId,
    },
  });

  const invoices = data?.invoices ?? [];

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ReceiptEuro className="h-5 w-5" />
          Invoice Payments
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {invoices.map((fee) => (
          <div
            key={fee.id}
            className="flex w-full items-center justify-between"
          >
            <span className="text-base">{fee.title}</span>
            <span>
              {fee.paymentCount} / {fee.studentCount}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FeeSummary;
