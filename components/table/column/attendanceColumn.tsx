"use client";

import { Badge } from "../../ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { isWeekend } from "date-fns";

type AttendanceList = {
  id: string;
  name: string;
  grade: {
    id: string;
    name: string;
  };
  date: Date;
  attendancePresentCount: number;
  activeStudentsCount: number;
};

export const attendanceColumn: ColumnDef<AttendanceList>[] = [
  {
    accessorFn: (row) => `${row.grade.name} ${row.name}`,
    header: "Class",
    cell: ({ row: { original } }) => (
      <span>
        {original.grade.name} {original.name}
      </span>
    ),
  },
  {
    accessorKey: "present",
    header: "Present",
    cell: ({ row: { original } }) => (
      <Badge variant="secondary" className="text-xs">
        {`${original.attendancePresentCount} / ${original.activeStudentsCount}`}{" "}
        present
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
      const isEndOfTheWeek = isWeekend(original.date);

      if (original.activeStudentsCount > 0 && !isEndOfTheWeek) {
        return (
          <DropdownOptions>
            <DropdownMenuItem asChild>
              <Link
                href={`/list/attendance/class/${original.id}?date=${original.date}`}
              >
                View
              </Link>
            </DropdownMenuItem>
          </DropdownOptions>
        );
      }
    },
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
    meta: { roles: ["manager"] },
  },
];
