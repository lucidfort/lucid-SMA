"use client";

import { ColumnDef } from "@tanstack/react-table";
import DropdownOptions from "@/components/DropdownOptions";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import DeleteModal from "@/components/DeleteModal";
import { Class } from "@/lib/generated/graphql/client";

export const classesColumn: ColumnDef<Class>[] = [
  {
    accessorFn: (row) => row.grade.name,
    header: "Grade",
    cell: ({ row: { original } }) => <span>{original.grade.name}</span>,
  },
  {
    accessorKey: "name",
    header: "Class",
    cell: ({ row: { original } }) => (
      <span className="capitalize">{original.name}</span>
    ),
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row: { original } }) => <span>{original.capacity}</span>,
  },
  {
    accessorKey: "studentCount",
    header: "Students",
    cell: ({ row: { original } }) => <span>{original?.studentCount}</span>,
  },
  {
    accessorFn: (row) => row.supervisors.map(s => `${s.name} ${s.surname}`).join(", ") || "supervisor",
    header: "Supervisor",
    cell: ({ row: { original } }) => (
      <span>
        {original?.supervisors?.map(s => `${s.name} ${s.surname}`).join(", ") || "-"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownOptions>
          <DropdownMenuItem asChild>
            <Link href={`/list/classes/${row.original.id}`}>View</Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <DeleteModal id={row.original.id} table="class">
              <span className="px-2 py-1 text-sm font-medium text-destructive">
                Delete
              </span>
            </DeleteModal>
          </DropdownMenuItem>
        </DropdownOptions>
      );
    },
  },
];
