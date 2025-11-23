"use client";

import { ColumnDef } from "@tanstack/react-table";
import { isToday, isWeekend } from "date-fns";
import StaffAttendanceMarker from "../StaffAttendanceMarker";
import DropdownOptions from "../DropdownOptions";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import Link from "next/link";

type StaffAttendanceList = {
  id: string;
  name: string;
  surname: string;
  date: Date;
  attendance?: {
    clockInTime?: Date;
    reasonForAbsence?: string;
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
    cell: ({ row: { original: { attendance } } }) => (
      <span>
        {attendance?.clockInTime ? (
          new Date(attendance.clockInTime).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", hour12: true })
        ) : "-"}
      </span>
    ),
    enableGlobalFilter: false,
  },
  {
    accessorKey: "attendance.reasonForAbsence",
    header: "Reason for Absence",
    cell: ({ row: { original: { attendance } } }) => (
      <span>
        {attendance?.reasonForAbsence ?? "-"}
      </span>
    ),
    enableGlobalFilter: false,
  },
  {
    id: "actions",
    cell: ({ row: { original: { date, id, attendance } } }) => {
      const isEndOfTheWeek = isWeekend(date);
      const isDateToday = isToday(date);

      return (
        <DropdownOptions>
          <DropdownMenuItem>
            <Link href={`/list/staffs/${id}`}>View Staff</Link>
          </DropdownMenuItem>

          {(!attendance && isDateToday && !isEndOfTheWeek) && (
            <>
              <DropdownMenuItem asChild>
                <StaffAttendanceMarker type="check-in" date={date} staffId={id} />
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <StaffAttendanceMarker type="absent" date={date} staffId={id} />
              </DropdownMenuItem>
            </>
          )}
        </DropdownOptions>
      )
    },
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
    meta: { roles: ["manager", "administration"] },
  },
];
