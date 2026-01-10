"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import DeleteModal from "@/components/dashboard/DeleteModal";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import StatusUpdateButton from "../../dashboard/buttons/StatusUpdateButton";
import { Grade } from "@/lib/generated/graphql/client";

export const gradesColumn: ColumnDef<Grade>[] = [
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row: { original } }) => <span>{original.name}</span>,
  },
  {
    accessorKey: "classes",
    header: "Classes",
    cell: ({ row: { original } }) => (
      <span>{original.classes.map((c) => c.name).join(", ")}</span>
    ),
  },
  {
    accessorKey: "students",
    header: "Enrolled Students",
    cell: ({ row: { original } }) => {
      const studentCount = original.classes.reduce(
        (acc, c) => acc + c.activeStudentsCount,
        0,
      );
      return <span>{studentCount}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
      return (
        <DropdownOptions>
          <div className="flex flex-col items-start justify-start gap-2">
            <DropdownMenuItem asChild>
              <Link
                href={`/list/grades/${original.id}`}
                className="w-full cursor-pointer"
              >
                View Grade
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <StatusUpdateButton
                type={original.isActive ? "deactivate" : "activate"}
                table="grade"
                id={original.id}
              />
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <DeleteModal
                id={original.id}
                table="grade"
                triggerTitle="Delete Grade"
              />
            </DropdownMenuItem>
          </div>
        </DropdownOptions>
      );
    },
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
    meta: { visibility: ["manager"] },
  },
];
