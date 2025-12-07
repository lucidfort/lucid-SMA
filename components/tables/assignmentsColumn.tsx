"use client";

import { Assignment } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import { schoolTerms } from "@/constants";
import FormModal from "@/components/FormModal";
import DeleteModal from "@/components/DeleteModal";
import DropdownOptions from "@/components/DropdownOptions";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export const assignmentsColumn: ColumnDef<Assignment>[] = [
  {
    accessorFn: (row) => row.subject.name,
    header: "Subject",
    cell: ({ row: { original } }) => <span>{original.subject.name}</span>,
  },
  {
    accessorFn: (row) => row.class.grade.name + " " + row.class.name,
    header: "Class",
    cell: ({ row: { original } }) => (
      <span>{original.class.grade.name + " " + original.class.name}</span>
    ),
  },
  {
    accessorFn: (row) => row.term.session,
    header: "Term",
    cell: ({ row: { original } }) => (
      <span>{schoolTerms.find((t) => t.id === original.term.session)?.name}</span>
    ),
  },
  {
    accessorKey: "maxScore",
    header: "Max Score",
    cell: ({ row: { original } }) => <span>{original.maxScore}</span>,
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row: { original } }) => (
      <span>
        {new Intl.DateTimeFormat("en-NG").format(new Date(original.startDate))}
      </span>
    ),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row: { original } }) => (
      <span>
        {new Intl.DateTimeFormat("en-NG").format(new Date(original.dueDate))}
      </span>
    ),
  },
  {
    id: "Actions",
    cell: ({ row: { original } }) => (
      <DropdownOptions>
        <>
          <FormModal
            table="assignment"
            type="update"
            data={original}
            triggerTitle="Update"
          />

          <DropdownMenuSeparator />

          <DeleteModal
            table="assignment"
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
