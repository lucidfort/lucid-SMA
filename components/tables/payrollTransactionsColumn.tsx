"use client"

import { PayrollProfile, PayrollTransactions } from "@/lib/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import DropdownOptions from "../DropdownOptions";
import { Badge } from "../ui/badge";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import FormModal from "../FormModal";
import { ClipboardCopy } from "lucide-react";

type Data = PayrollProfile & {
    staff: {
        id: string;
        name: string;
        surname: string;
    }
    transaction?: PayrollTransactions;
    date: string;
}

export const payrollTransactionsColumn: ColumnDef<Data>[] = [
    {
        accessorFn: (row) => `${row?.staff.name} ${row?.staff.surname}`,
        header: 'Staff',
        cell: ({ row: { original } }) => <div>{original?.staff.name} {original?.staff.surname}</div>
    },
    {
        accessorKey: "Amount Paid",
        header: 'Amount Paid',
        cell: ({ row: { original } }) => <span>₦{original?.transaction?.amount || 0}</span>,
        enableGlobalFilter: false,
        enableHiding: false,
        enableSorting: false
    },
    {
        accessorKey: "status",
        header: 'Status',
        cell: ({ row: { original } }) => <Badge>{original?.transaction?.status || "INACTIVE"}</Badge>,
        enableGlobalFilter: false,
        enableHiding: false,
        enableSorting: false
    },
    {
        accessorKey: "reference",
        header: 'Reference',
        cell: ({ row: { original } }) => (
            <div className="flex items-center gap-0.5">
                <span className="w-28 line-clamp-1 text-ellipsis">{original?.transaction?.id || "-"}</span>

                {original.transaction && (
                    <ClipboardCopy className="size-4 text-gray-500 cursor-pointer hover:text-gray-800" onClick={async () => await navigator.clipboard.writeText(original.transaction?.id || "")} />
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
                            <DropdownMenuItem asChild>
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
]
