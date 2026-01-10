"use client";

import { Invoice } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import DeleteModal from "@/components/dashboard/DeleteModal";
import FormModal from "@/components/form/ui/FormModal";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { RoleAccessLevel } from "@/types";
import { Badge } from "@/components/ui/badge";

interface InvoicesColumnType extends Invoice {
  accessLevel: RoleAccessLevel;
}

export const invoicesColumn: ColumnDef<InvoicesColumnType>[] = [
  {
    accessorKey: "number",
    header: "Number",
    cell: ({ row: { original } }) => <span>{original.number}</span>,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row: { original } }) => <span>{original.title}</span>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row: { original } }) => <div>₦{original.amount}</div>,
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row: { original } }) => (
      <div>
        {original.dueDate
          ? new Intl.DateTimeFormat("en-NG").format(new Date(original?.dueDate))
          : "-"}
      </div>
    ),
  },
  {
    accessorFn: (row) =>
      row?.grades.map((grade) => grade.name).join(", ") || "grade",
    header: "Grade",
    cell: ({ row: { original } }) => (
      <div>{original.grades.map((grade) => grade.name).join(", ") || "-"}</div>
    ),
  },
  {
    accessorKey: "hasPaid",
    header: "Status",
    cell: ({ row: { original } }) => (
      <Badge variant={original?.hasPaid ? "secondary" : "destructive"}>
        {original?.hasPaid ? "PAID" : "UNPAID"}
      </Badge>
    ),
    enableHiding: false,
    enableGlobalFilter: false,
    meta: { roles: ["parent"] },
  },
  {
    id: "parent-actions",
    cell: ({ row: { original } }) => (
      <DropdownOptions>
        <DropdownMenuItem asChild>
          <Link
            href={
              !original?.hasPaid
                ? `/finance/invoice/pay?invoice=${original.id}`
                : `/finance/invoice/transactions?invoice=${original.id}`
            }
          >
            {!original?.hasPaid ? "Initiate Transaction" : "View Transaction"}
          </Link>
        </DropdownMenuItem>
      </DropdownOptions>
    ),
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    meta: { roles: ["parent"] },
  },
  {
    id: "admin-actions",
    cell: ({ row: { original } }) => {
      return (
        <DropdownOptions>
          <DropdownMenuItem asChild>
            <Link href={`/finance/invoice/pay?invoice=${original.id}`}>
              Initiate Transaction
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <FormModal table="invoice" type="update" data={original} />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <DeleteModal
              id={original.id}
              table="invoice"
              triggerTitle="Delete Invoice"
            />
          </DropdownMenuItem>
        </DropdownOptions>
      );
    },
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
    meta: { roles: ["manager"] },
  },
];
