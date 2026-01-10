import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Invoice } from "@/lib/generated/graphql/server";
import { ReceiptEuro } from "lucide-react";
import Link from "next/link";

interface FeeSummaryCardProps {
  invoices: Pick<Invoice, "id" | "title" | "studentCount" | "paymentCount">[];
}

const FeeSummaryCard = ({ invoices }: FeeSummaryCardProps) => {
  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ReceiptEuro className="h-5 w-5" />
          Invoice Payments
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 px-4">
        {invoices.map((fee) => (
          <div
            key={fee.id}
            className="flex w-full items-center justify-between"
          >
            <Link
              href={`/finance/invoice/transactions?invoice=${fee.id}`}
              className="hover:underline"
            >
              {fee.title}
            </Link>
            <span>
              <span className="text-primary font-semibold">
                {fee.paymentCount}
              </span>
              /{fee.studentCount} paid
            </span>
          </div>
        ))}

        {invoices.length === 0 && (
          <div className="py-5 text-center text-sm font-light text-gray-600">
            No invoice for this term
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeSummaryCard;
