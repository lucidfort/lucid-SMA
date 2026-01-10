"use client";

import { Exam } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import FormModal from "@/components/form/ui/FormModal";
import DeleteModal from "@/components/dashboard/DeleteModal";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export const examsColumn: ColumnDef<Exam>[] = [
  {
    accessorFn: (row) => row.subject.name,
    header: "Subject",
    cell: ({ row: { original } }) => <span>{original.subject.name}</span>,
  },
  {
    accessorFn: (row) => row.grade.name,
    header: "Grade",
    cell: ({ row: { original } }) => <span>{original.grade.name}</span>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row: { original } }) => <span>{original.type}</span>,
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
    id: "Actions",
    cell: ({ row: { original } }) => (
      <DropdownOptions>
        <>
          <DropdownMenuItem asChild>
            <Link href={`/list/exams/${original.id}`}>View</Link>
          </DropdownMenuItem>

          <FormModal table="exam" type="update" data={original} />

          <DropdownMenuSeparator />

          <DeleteModal table="exam" id={original.id} triggerTitle="Delete" />
        </>
      </DropdownOptions>
    ),
    enableHiding: false,
    enableSorting: false,
    enableGlobalFilter: false,
    meta: { roles: ["manager", "teacher"] },
  },
];
