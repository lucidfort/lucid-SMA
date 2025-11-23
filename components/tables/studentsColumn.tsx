"use client";

import { Student } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DeleteModal from "../DeleteModal";
import DropdownOptions from "../DropdownOptions";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";

export const studentsColumn: ColumnDef<Student>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
  },
  {
    id: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent"
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorFn: (row) => `${row.name} ${row.surname}`,
    filterFn: (row, columnId, filterValue) => {
      const fullName = row.original.name + " " + row.original.surname;
      return fullName.toLowerCase().includes(filterValue.toLowerCase());
    },
    cell: ({ row: { original: student } }) => (
      <span className="flex items-center gap-4">
        <Image
          src={student.img || "/noAvatar.png"}
          alt="student"
          width={40}
          height={40}
          className="h-10 w-10 rounded-full"
        />
        <h3>{student.name + " " + student.surname}</h3>
      </span>
    ),
  },
  {
    header: "Registration No",
    accessorKey: "registration Number",
    cell: ({ row: { original: student } }) => (
      <span>{student.registrationNumber}</span>
    ),
  },
  {
    header: "Sex",
    accessorKey: "sex",
    cell: ({ row: { original: student } }) => <span>{student.sex[0]}</span>,
  },
  {
    id: "Class",
    header: "Class",
    accessorFn: (row) => `${row.class.grade.name} ${row.class.name}`,
    cell: ({ row: { original: student } }) => (
      <span>
        {student.class.grade.name} {student.class.name}
      </span>
    ),
  },
  {
    header: "Address",
    accessorKey: "address",
    cell: ({ row: { original: student } }) => <span>{student.address}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownOptions>
          <DropdownMenuItem asChild>
            <Link href={`/list/students/${row.original.id}`}>View student</Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <DeleteModal id={row.original.id} table="student">
              <span className="px-2 py-1 text-sm font-medium text-destructive">
                Delete Student
              </span>
            </DeleteModal>
          </DropdownMenuItem>
        </DropdownOptions>
      );
    },
  },
];
