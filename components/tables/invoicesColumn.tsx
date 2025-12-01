"use client"

import { Invoice } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import DeleteModal from "../DeleteModal";
import FormModal from "../FormModal";
import DropdownOptions from "../DropdownOptions";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import Link from "next/link";
import { schoolTerms } from "@/constants";

export const invoicesColumn: ColumnDef<Invoice>[] = [
    {
        accessorKey: "number",
        header: "Number",
        cell: ({ row: { original } }) => <span>{original.number}</span>
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row: { original } }) => <span>{original.title}</span>
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row: { original } }) => <div>₦{original.amount}</div>
    },
    {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ row: { original } }) => <div>{original.dueDate ? new Intl.DateTimeFormat("en-NG").format(new Date(original?.dueDate)) : "-"}</div>
    },
    {
        accessorKey: "term",
        header: "Term",
        cell: ({ row: { original: { term } } }) => {
            const name = schoolTerms.find(t => t.id == term.session)?.name

            return (
                <div>{name ?? "-"} Term, {term.academicYear.year}</div>
            )
        }
    },
    {
        accessorFn: (row) => row?.grades.map(grade => grade.name).join(", ") || "grade",
        header: 'Grade',
        cell: ({ row: { original } }) => <div>{original.grades.map(grade => grade.name).join(", ") || "-"}</div>
    },
    {
        id: "actions",
        cell: ({ row: { original } }) => {
            return (
                <DropdownOptions>
                    <>
                        <DropdownMenuItem asChild>
                            <Link href={`/list/fees/pay?invoiceId=${original.id}`}>
                                Initiate Transaction
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <FormModal
                                table="invoice"
                                type="update"
                                data={original}
                            />
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <DeleteModal
                                id={original.id}
                                table="invoice"
                                triggerTitle="Delete Invoice"
                            />
                        </DropdownMenuItem>
                    </>
                </DropdownOptions>
            );
        },
        enableSorting: false,
        enableGlobalFilter: false,
        enableHiding: false,
        meta: { visibility: ["manager", "administration"] },
    },
]
