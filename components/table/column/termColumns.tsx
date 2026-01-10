"use client";

import DropdownOptions from "@/components/dashboard/DropdownOptions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import StatusUpdateButton from "../../dashboard/buttons/StatusUpdateButton";
import { Badge } from "../../ui/badge";
import { Term } from "@/lib/generated/graphql/client";
import Link from "next/link";
import DeleteModal from "@/components/dashboard/DeleteModal";

export const termColumns: ColumnDef<Term>[] = [
  {
    header: "Session",
    accessorFn: (row) => row.session,
    cell: ({ row: { original } }) => <span>{original.session}</span>,
  },
  {
    header: "Academic Year",
    accessorFn: (row) => row.academicYear.year,
    cell: ({ row: { original } }) => <span>{original.academicYear.year}</span>,
  },
  {
    header: "Status",
    accessorKey: "isCurrent",
    cell: ({ row: { original } }) =>
      original.isCurrent && <Badge>Current</Badge>,
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
  },
  {
    header: "Start Date",
    accessorKey: "startDate",
    cell: ({ row: { original } }) => (
      <span>
        {new Intl.DateTimeFormat("en-NG").format(new Date(original.startDate))}
      </span>
    ),
  },
  {
    header: "End Date",
    accessorKey: "endDate",
    cell: ({ row: { original } }) => (
      <span>
        {original?.endDate
          ? new Intl.DateTimeFormat("en-NG").format(new Date(original.endDate))
          : "-"}
      </span>
    ),
  },
  {
    header: "",
    accessorKey: "action",
    cell: ({
      row: {
        original: { isCurrent, id, academicYear },
      },
    }) => {
      return (
        <>
          <DropdownOptions>
            <DropdownMenuItem asChild>
              <Link href={`/list/terms/${id}`}>View</Link>
            </DropdownMenuItem>

            {!isCurrent && (
              <DropdownMenuItem asChild>
                <StatusUpdateButton
                  type={isCurrent ? "deactivate" : "activate"}
                  table="term"
                  id={id}
                  academicYearId={academicYear.id}
                />
              </DropdownMenuItem>
            )}

            <DropdownMenuItem asChild>
              <DeleteModal id={id} table="term" triggerTitle="Delete" />
            </DropdownMenuItem>
          </DropdownOptions>
        </>
      );
    },
    meta: { roles: ["manager"] },
    enableHiding: false,
  },
];
