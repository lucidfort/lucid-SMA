"use client"

import { InvoicePayment } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../ui/badge";
import { format } from "date-fns"

export const transactionsColumn: ColumnDef<InvoicePayment>[] = [
    {
        accessorKey: "reference",
        header: 'Reference',
        cell: ({ row: { original } }) => <span>{original.reference}</span>
    },
    {
        accessorKey: "invoice.number",
        header: 'Invoice Number',
        cell: ({ row: { original } }) => <span>{original.invoice.number}</span>
    },
    {
        accessorFn: (row) => row.students.map(student => `${student.name} ${student.surname}`).join(", "),
        header: 'Students',
        cell: ({ row: { original } }) => <div>{original.students.map(student => `${student.name} ${student.surname}`).join(", ") || "-"}</div>
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row: { original } }) => <div>₦{original.amountPaid}</div>
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row: { original } }) => <Badge>{original.status}</Badge>
    },
    {
        accessorKey: "createdAt",
        header: "Creation Date",
        cell: ({ row: { original } }) => {
            const date = new Date(original.createdAt)
            return (
                <div>
                    {format(date, "MMM d, yyyy - h:mm a")}
                </div>
            )
        }
    },
    {
        accessorKey: "paidAt",
        header: "Payment Date",
        cell: ({ row: { original: { paidAt } } }) => {
            const formatted = paidAt ? format(new Date(paidAt), "MMM d, yyyy - h:mm a") : "-"

            return (
                <div>
                    {formatted}
                </div>
            )
        }
    },
]
