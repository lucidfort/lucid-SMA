"use client";

import DropdownOptions from "@/components/dashboard/DropdownOptions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import StatusUpdateButton from "../../dashboard/buttons/StatusUpdateButton";
import { Badge } from "../../ui/badge";
import { AcademicYear } from "@/lib/generated/graphql/client";
import { schoolTerms } from "@/lib/constants";
import Link from "next/link";
import DeleteModal from "@/components/dashboard/DeleteModal";

export const academicYearColumn: ColumnDef<AcademicYear>[] = [
  {
    header: "Session",
    accessorKey: "year",
    cell: ({
      row: {
        original: { year },
      },
    }) => <span>{year}</span>,
  },
  {
    header: "Status",
    accessorKey: "isCurrent",
    cell: ({
      row: {
        original: { isCurrent },
      },
    }) => <>{isCurrent && <Badge>Current</Badge>}</>,
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
    cell: ({
      row: {
        original: { endDate },
      },
    }) => (
      <span>
        {endDate
          ? new Intl.DateTimeFormat("en-NG").format(new Date(endDate))
          : "-"}
      </span>
    ),
  },
  {
    header: "Current Term",
    accessorKey: "currentTerm",
    cell: ({
      row: {
        original: { isCurrent, terms },
      },
    }) => {
      const session =
        schoolTerms.find((t) => terms?.[0]?.session === t.id)?.name || "";

      if (isCurrent) {
        return <span>{session}</span>;
      }
    },
  },
  {
    header: "",
    accessorKey: "action",
    cell: ({ row: { original } }) => {
      return (
        <DropdownOptions>
          <DropdownMenuItem asChild>
            <Link href={`/list/academic-years/${original.id}`}>View</Link>
          </DropdownMenuItem>

          {!original.isCurrent && (
            <DropdownMenuItem asChild>
              <StatusUpdateButton
                type={original.isCurrent ? "deactivate" : "activate"}
                table="academic-year"
                id={original.id}
              />
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <DeleteModal
              id={original.id}
              table="academic-year"
              triggerTitle="Delete"
            />
          </DropdownMenuItem>
        </DropdownOptions>
      );
    },
    meta: { roles: ["manager"] },
    enableHiding: false,
  },
];
