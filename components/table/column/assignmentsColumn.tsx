"use client";

import { Assessment } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import FormModal from "@/components/form/ui/FormModal";
import DeleteModal from "@/components/dashboard/DeleteModal";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export const assignmentsColumn: ColumnDef<Assessment>[] = [
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
    accessorKey: "maxScore",
    header: "Score",
    cell: ({ row: { original } }) => <span>{original.maxScore}</span>,
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
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
          <DropdownMenuItem asChild>
            <Link href={`/list/assignments/${original.id}`}>View</Link>
          </DropdownMenuItem>

          <FormModal table="assignment" type="update" data={original} />

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
    meta: { roles: ["manager", "teacher"] },
  },
];
