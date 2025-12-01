"use client";

import DropdownOptions from "@/components/DropdownOptions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { schoolTerms } from "@/constants";
import { ColumnDef } from "@tanstack/react-table";
import StatusUpdateButton from "../shareable/StatusUpdateButton";
import { Badge } from "../ui/badge";

type TermsList = {
  id: string;
  year?: string;
  session?: number;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  academicYearId?: string;
};

export const termsColumns: ColumnDef<TermsList>[] = [
  {
    header: "Session",
    accessorFn: (row) => row.year || row.session,
    cell: ({
      row: {
        original: { session, year },
      },
    }) => (
      <div className="flex items-center gap-0.5">
        {session && (
          <span>{schoolTerms.find(term => term.id === session)?.name} Term,</span>
        )}
        <span>
          {year}
        </span>
      </div>
    ),
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
    header: "",
    accessorKey: "isCurrent",
    cell: ({
      row: {
        original: { isCurrent },
      },
    }) => (
      <>
        {isCurrent && (
          <Badge>Current</Badge>
        )}
      </>
    ),
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
  },
  {
    header: "",
    accessorKey: "action",
    cell: ({ row: { original } }) => {
      return (
        <>
          {!original.isCurrent && (

            <DropdownOptions>
              <DropdownMenuItem asChild>
                <StatusUpdateButton
                  type={original.isCurrent ? "deactivate" : "activate"}
                  field={original.session ? "term" : "academic-year"}
                  id={original.id}
                  academicYearId={original.academicYearId}
                />
              </DropdownMenuItem>
            </DropdownOptions>
          )}
        </>
      )
    },
    meta: { roles: ["manager", "administration"] },
    enableHiding: false,
  },
];
