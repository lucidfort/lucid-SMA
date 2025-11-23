"use client";

import DeleteModal from "@/components/DeleteModal";
import DropdownOptions from "@/components/DropdownOptions";
import FormModal from "@/components/FormModal";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Result } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";

export const resultsColumn: ColumnDef<Result>[] = [
    {
        accessorKey: "uploadedAt",
        header: "Uploaded At",
        cell: ({ row: { original } }) => (
            <span>
                {new Date(original.uploadedAt).toLocaleDateString("en-NG", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })}
            </span>
        ),
    },
    {
        id: "Actions",
        cell: ({ row: { original } }) => (
            <DropdownOptions>
                <>
                    <FormModal
                        table="result"
                        type="update"
                        data={original}
                        triggerTitle="Update"
                    />

                    <DropdownMenuSeparator />

                    <DeleteModal
                        table="result"
                        id={original.id}
                        triggerTitle="Delete"
                    />
                </>
            </DropdownOptions>
        ),
        enableHiding: false,
        enableSorting: false,
        enableGlobalFilter: false,
    },
];
