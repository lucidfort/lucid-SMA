"use client";

import { ColumnDef } from "@tanstack/react-table";
import DeleteModal from "@/components/dashboard/DeleteModal";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import FormModal from "@/components/form/ui/FormModal";

type SubjectsList = {
  id: string;
  name: string;
  teachers: {
    teacher: { id: string; name: string; surname: string };
  }[];
};

export const subjectsColumn: ColumnDef<SubjectsList>[] = [
  {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent"
      >
        Subject
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorKey: "name",
    cell: ({ row: { original } }) => <span>{original.name}</span>,
  },
  {
    header: "Teachers",
    accessorKey: "teachers",
    cell: ({ row: { original } }) => {
      const teacherNames = original.teachers.map(
        (t) => t.teacher.name + " " + t.teacher.surname,
      );
      return (
        <span>{teacherNames.length > 0 ? teacherNames.join(", ") : "-"}</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
      return (
        <DropdownOptions>
          <DropdownMenuItem asChild>
            <FormModal
              table="subject"
              type="update"
              data={original}
              triggerTitle="Update"
            />
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <DeleteModal id={original.id} table="subject">
              <span className="text-destructive px-2 py-1 text-sm font-medium">
                Delete
              </span>
            </DeleteModal>
          </DropdownMenuItem>
        </DropdownOptions>
      );
    },
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
    meta: { visibility: ["manager"] },
  },
];
