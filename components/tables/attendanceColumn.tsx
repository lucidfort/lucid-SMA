"use client";

import { Badge } from "../ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import DropdownOptions from "@/components/DropdownOptions";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

type AttendanceList = {
  id: string;
  name: string;
  date: Date;
  attendancePresentCount: number;
  studentCount: number
};

export const attendanceColumn: ColumnDef<AttendanceList>[] = [
  {
    accessorKey: "class",
    header: "Class",
    cell: ({ row: { original } }) => <span>{original.name}</span>,
  },
  {
    accessorKey: "present",
    header: "Present",
    cell: ({ row: { original } }) => (
      <Badge variant="secondary" className="text-xs">
        {`${original.attendancePresentCount} / ${original.studentCount}`} present
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
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
    },
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
    meta: { roles: ["manager", "administration"] },
  },
];
