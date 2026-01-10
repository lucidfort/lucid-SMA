"use client";

import { ColumnDef } from "@tanstack/react-table";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ClipboardCopy } from "lucide-react";
import {
  PaymentStatus,
  PayrollProfile,
  PayrollTransaction,
} from "@/lib/generated/graphql/client";
import FormModal from "@/components/form/ui/FormModal";
import { cn } from "@/lib/utils/client.utils";

type Data = PayrollProfile & {
  date: string;
  transaction?: PayrollTransaction;
};

export const payrollTransactionsColumn: ColumnDef<Data>[] = [
  {
    accessorFn: (row) => `${row?.staff.name} ${row?.staff.surname}`,
    header: "Staff",
    cell: ({ row: { original } }) => (
      <div>
        {original?.staff.name} {original?.staff.surname}
      </div>
    ),
  },
  {
    accessorKey: "Amount Paid",
    header: "Amount Paid",
    cell: ({ row: { original } }) => (
      <span>₦{original?.transaction?.amount || 0}</span>
    ),
    enableGlobalFilter: false,
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({
      row: {
        original: { transaction },
      },
    }) => {
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
            transaction && statusStyles[transaction?.status],
          )}
        >
          {transaction?.status ?? "INACTIVE"}
        </Badge>
      );
    },
    enableGlobalFilter: false,
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row: { original } }) => (
      <div className="flex items-center gap-0.5">
        <span className="line-clamp-1 w-28 text-ellipsis">
          {original?.transaction?.id || "-"}
        </span>

        {original.transaction && (
          <ClipboardCopy
            className="size-4 cursor-pointer text-gray-500 hover:text-gray-800"
            onClick={async () =>
              await navigator.clipboard.writeText(
                original.transaction?.id || "",
              )
            }
          />
        )}
      </div>
    ),
    enableGlobalFilter: false,
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
      if (original?.transaction?.status !== "SUCCESS") {
        return (
          <DropdownOptions>
            <>
              <DropdownMenuItem asChild className="py-0.5">
                <FormModal
                  type="create"
                  data={original}
                  table="payroll-transaction"
                  formTitle={`Initiate Transaction for ${original?.date}`}
                  triggerTitle="Initiate Transaction"
                />
              </DropdownMenuItem>
            </>
          </DropdownOptions>
        );
      }
    },
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
    meta: { visibility: ["manager", "finance"] },
  },
];
