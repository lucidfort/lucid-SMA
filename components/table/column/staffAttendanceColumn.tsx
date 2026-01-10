"use client";

import { ColumnDef } from "@tanstack/react-table";
import { isToday, isWeekend } from "date-fns";
import StaffAttendanceMarker from "@/components/dashboard/StaffAttendanceMarker";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type StaffAttendanceList = {
  id: string;
  name: string;
  surname: string;
  date: Date;
  attendance?: {
    id: string;
    clockInTime?: string;
    note?: string;
  };
};

export const staffAttendanceColumn: ColumnDef<StaffAttendanceList>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row: { original } }) => (
      <span>{original.name + " " + original.surname}</span>
    ),
  },
  {
    accessorKey: "attendance.clockInTime",
    header: "Clock In Time",
    cell: ({
      row: {
        original: { attendance },
      },
    }) => <span>{attendance?.clockInTime || "-"}</span>,
    enableGlobalFilter: false,
  },
  {
    accessorKey: "attendance.note",
    header: "Reason for Absence",
    cell: ({
      row: {
        original: { attendance },
      },
    }) => <span>{attendance?.note ?? "-"}</span>,
    enableGlobalFilter: false,
  },
  {
    id: "actions",
    cell: ({
      row: {
        original: { date, id, attendance },
      },
    }) => {
      const isEndOfTheWeek = isWeekend(date);
      const isDateToday = isToday(date);

      if (!attendance && isDateToday && !isEndOfTheWeek) {
        return (
          <DropdownOptions>
            <DropdownMenuItem asChild>
              <StaffAttendanceMarker type="check-in" date={date} staffId={id} />
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <StaffAttendanceMarker type="absent" date={date} staffId={id} />
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
