"use client";

import DeleteModal from "@/components/dashboard/DeleteModal";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import FormModal from "@/components/form/ui/FormModal";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";

interface Result {
  id: string;
  score: number;
  uploadedAt: Date | string;
  type: "assessment" | "exam";
  test: {
    id: string;
    maxScore: number;
    subject: {
      name: string;
    };
  };
  student: {
    id: string;
    name: string;
    surname: string;
    class: {
      id: string;
      gradeId: string;
    };
  };
}

export const resultsColumn: ColumnDef<Result>[] = [
  {
    accessorFn: (row) => row.test.subject.name,
    header: "Subject",
    cell: ({ row: { original } }) => <span>{original.test.subject.name}</span>,
  },
  {
    accessorFn: (row) => row.student.name + " " + row.student.surname,
    header: "Student",
    cell: ({ row: { original } }) => (
      <span>
        {original.student.name} {original.student.surname}
      </span>
    ),
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row: { original } }) => (
      <span>
        {original.score}/{original.test.maxScore} marks
      </span>
    ),
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row: { original } }) => (
      <span className="text-center uppercase">{original.type}</span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "uploadedAt",
    header: "Uploaded At",
    cell: ({ row: { original } }) => (
      <span>
        {new Date(original.uploadedAt).toLocaleDateString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </span>
    ),
  },
  {
    id: "Actions",
    cell: ({ row: { original } }) => (
      <DropdownOptions>
        <>
          <FormModal
            table={
              original.type === "exam" ? "exam-result" : "assessment-result"
            }
            type="update"
            data={original}
            triggerTitle="Update"
          />

          <DropdownMenuSeparator />

          <DeleteModal
            table={
              original.type === "exam" ? "exam-result" : "assessment-result"
            }
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
