import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoicePayment } from "@/lib/generated/graphql/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Props {
  transactions: InvoicePayment[];
}

const RecentTransactionsCard = ({ transactions }: Props) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button
          variant="outline"
          className="ml-auto border-none bg-transparent text-xs"
          size="sm"
        >
          <Link href="/finance/invoice/transactions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">
                    {transaction.invoice?.number}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">
                    ₦{(transaction?.amountPaid ?? 0).toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Due: {transaction.createdAt}
                  </p>
                </div>
                <Badge
                  variant={
                    transaction.status === "PENDING"
                      ? "default"
                      : transaction.status === "SUCCESS"
                        ? "secondary"
                        : transaction.status === "FAILED"
                          ? "destructive"
                          : "outline"
                  }
                >
                  {transaction.status}
                </Badge>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="py-5 text-center text-sm font-light text-gray-600">
              No transactions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsCard;
