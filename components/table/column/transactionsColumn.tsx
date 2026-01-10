"use client";

import { InvoicePayment, PaymentStatus } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../ui/badge";
import { format } from "date-fns";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import { PaymentVerificator } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/client.utils";

export const transactionsColumn: ColumnDef<InvoicePayment>[] = [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row: { original } }) => <span>{original.reference}</span>,
  },
  {
    accessorKey: "invoice.number",
    header: "Invoice Number",
    cell: ({ row: { original } }) => <span>{original.invoice.number}</span>,
  },
  {
    accessorFn: (row) =>
      row.students
        .map((student) => `${student.name} ${student.surname}`)
        .join(", "),
    header: "Students",
    cell: ({ row: { original } }) => (
      <div>
        {original.students
          .map((student) => `${student.name} ${student.surname}`)
          .join(", ") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row: { original } }) => <div>₦{original.amountPaid}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row: { original } }) => {
      const statusStyles: Record<PaymentStatus, string> = {
        SUCCESS: "bg-green-600 ",
        FAILED: "bg-red-600",
        REFUNDED: "bg-orange-400 text-black",
        PENDING: "bg-lamaYellow text-primary",
        PROCESSING: "bg-lamaSky text-primary",
      };

      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-primary-btn text-invert",
            statusStyles[original.status],
          )}
        >
          {original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Creation Date",
    cell: ({ row: { original } }) => {
      const date = new Date(original.createdAt);
      return <div>{format(date, "MMM d, yyyy - h:mm a")}</div>;
    },
  },
  {
    accessorKey: "paidAt",
    header: "Payment Date",
    cell: ({
      row: {
        original: { paidAt },
      },
    }) => {
      const formatted = paidAt
        ? format(new Date(paidAt), "MMM d, yyyy,  h:mm a")
        : "-";

      return <div>{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
      if (original.status === "PENDING") {
        return (
          <DropdownOptions>
            <PaymentVerificator
              mode="manual"
              reference={original.reference}
              trigger={
                <Button className="hover:bg-lamaYellowLight text-primary-btn cursor-pointer bg-transparent">
                  Verify Payment
                </Button>
              }
            />
          </DropdownOptions>
        );
      }
    },
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
  },
];
