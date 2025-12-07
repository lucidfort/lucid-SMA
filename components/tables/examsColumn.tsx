"use client";

import { Exam } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import { schoolTerms } from "@/constants";
import FormModal from "@/components/FormModal";
import DeleteModal from "@/components/DeleteModal";
import DropdownOptions from "@/components/DropdownOptions";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export const examsColumn: ColumnDef<Exam>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row: { original } }) => <span>{original.type}</span>,
  },
  {
    accessorFn: (row) => row.subject.name,
    header: "Subject",
    cell: ({ row: { original } }) => <span>{original.subject.name}</span>,
  },
  {
    accessorFn: (row) => row.grade.name,
    header: "Class",
    cell: ({ row: { original } }) => <span>{original.grade.name}</span>,
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
    accessorKey: "date",
    header: "Date",
    cell: ({ row: { original } }) => (
      <span>
        {new Intl.DateTimeFormat("en-NG").format(new Date(original.date))}
      </span>
    ),
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row: { original } }) => <span>{original.startTime}</span>,
  },
  {
    id: "Actions",
    cell: ({ row: { original } }) => (
      <DropdownOptions>
        <>
          <FormModal table="exam" type="update" data={original} />

          <DropdownMenuSeparator />

          <DeleteModal table="exam" id={original.id} triggerTitle="Delete" />
        </>
      </DropdownOptions>
    ),
    enableHiding: false,
    enableSorting: false,
    enableGlobalFilter: false,
  },
];
