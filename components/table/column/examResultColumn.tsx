"use client";

import DeleteModal from "@/components/dashboard/DeleteModal";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

interface Result {
  studentId: string;
  studentName: string;
  studentRegNo: string;
  studentScore: number;
  classId: string;
  className: string;
}

export const examResultColumn: ColumnDef<Result>[] = [
  {
    accessorKey: "studentName",
    header: "Student",
    cell: ({ row: { original } }) => <span>{original.studentName}</span>,
  },
  {
    accessorKey: "studentRegNo",
    header: "Registration No",
    cell: ({ row: { original } }) => <span>{original.studentRegNo}</span>,
  },
  {
    accessorKey: "className",
    header: "Class",
    cell: ({ row: { original } }) => <span>{original.className}</span>,
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row: { original } }) => <span>{original.studentScore}</span>,
    enableGlobalFilter: false,
  },
  {
    id: "Actions",
    cell: ({ row: { original } }) => (
      <DropdownOptions>
        <>
          <DropdownMenuItem asChild>
            <Link href={`/list/students/${original.studentId}`}>
              View Student
            </Link>
          </DropdownMenuItem>
          {/*<FormModal*/}
          {/*  table={*/}
          {/*    original.type === "exam" ? "exam-result" : "assessment-result"*/}
          {/*  }*/}
          {/*  type="update"*/}
          {/*  data={original}*/}
          {/*  triggerTitle="Update"*/}
          {/*/>*/}

          {/*<DropdownMenuSeparator />*/}

          <DeleteModal
            table={"exam-result"}
            id={original.classId}
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
