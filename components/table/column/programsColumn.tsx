"use client";

import DeleteModal from "@/components/dashboard/DeleteModal";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Program } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import StatusUpdateButton from "../../dashboard/buttons/StatusUpdateButton";

export const programsColumn: ColumnDef<Program>[] = [
  {
    accessorKey: "name",
    header: "Program",
    cell: ({ row: { original } }) => <span>{original.name}</span>,
  },
  {
    accessorFn: (row) => row.grades.map((grade) => grade.name).join(", "),
    header: "Grades",
    cell: ({ row: { original } }) => (
      <span>{original.grades.map((c) => c.name).join(", ")}</span>
    ),
  },
  {
    accessorKey: "students",
    header: "Active Students",
    cell: ({ row: { original } }) => {
      const studentCount = original.grades.reduce((acc, grade) => {
        return acc + grade.activeStudentsCount;
      }, 0);

      return <span>{studentCount}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
      return (
        <DropdownOptions>
          <>
            <DropdownMenuItem asChild>
              <Link href={`/list/grades/${original.id}`}>View Grade</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <StatusUpdateButton
                type={original.isActive ? "deactivate" : "activate"}
                table="program"
                id={original.id}
              />
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <DeleteModal id={original.id} table="grade">
                <span className="text-destructive px-2 py-1 text-sm font-medium">
                  Delete Grade
                </span>
              </DeleteModal>
            </DropdownMenuItem>
            <DropdownMenuItem asChild></DropdownMenuItem>
          </>
        </DropdownOptions>
      );
    },
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
    meta: { visibility: ["manager"] },
  },
];
