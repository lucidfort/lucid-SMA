"use client"

import { PayrollProfile } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import DeleteModal from "../DeleteModal";
import DropdownOptions from "../DropdownOptions";
import FormModal from "../FormModal";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export const payrollProfileColumns: ColumnDef<PayrollProfile>[] = [
    {
        accessorFn: (row) => `${row.staff.name} ${row.staff.surname}`,
        header: 'Staff',
        cell: ({ row: { original: { staff } } }) => <div>{staff.name} {staff.surname}</div>
    },
    {
        accessorKey: "bankName",
        header: 'Bank Name',
        cell: ({ row: { original } }) => <span>{original.bankName}</span>
    },
    {
        accessorKey: "accountNumber",
        header: 'Account Number',
        cell: ({ row: { original } }) => <span>{original.accountNumber}</span>
    },
    {
        accessorKey: "accountName",
        header: 'Account Name',
        cell: ({ row: { original } }) => <span>{original.accountName}</span>
    },
    {
        accessorKey: "salary",
        header: 'Salary',
        cell: ({ row: { original } }) => <span>₦{original.salary}</span>
    },
    {
        accessorKey: "recipientCode",
        header: 'Recipient Code',
        cell: ({ row: { original } }) => <span>{original.recipientCode}</span>,
        enableSorting: false,
        enableGlobalFilter: false
    },
    {
        id: "actions",
        cell: ({ row: { original } }) => {
            return (
                <DropdownOptions>
                    <>
                        <DropdownMenuItem asChild>
                            <FormModal table="payroll-profile" type="update" data={original} />
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <DeleteModal
                                id={original.id}
                                table="payroll-profile"
                                triggerTitle="Delete"
                            />
                        </DropdownMenuItem>
                    </>
                </DropdownOptions>
            );
        },
        enableSorting: false,
        enableGlobalFilter: false,
        enableHiding: false,
        meta: { visibility: ["manager", "finance"] },
    },
]
