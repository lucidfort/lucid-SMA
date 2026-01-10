"use client";

import { Student, StudentStatus } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DeleteModal from "../../dashboard/DeleteModal";
import DropdownOptions from "../../dashboard/DropdownOptions";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/dashboard/UserAvatar";

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
    cell: ({
      row: {
        original: { name, surname, img },
      },
    }) => (
      <div className="flex items-center gap-2">
        <UserAvatar name={`${name} ${surname}`} img={img} className="size-10" />
        <span>
          {name} {surname}
        </span>
      </div>
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
    header: "Status",
    accessorKey: "status",
    enableHiding: false,
    enableGlobalFilter: false,
    enableGrouping: true,
    cell: ({
      row: {
        original: { status },
      },
    }) => {
      const getStatusBadge = (status: StudentStatus) => {
        const statusConfig = {
          ACTIVE: "bg-green-100 text-green-700 border-green-200",
          SUSPENDED: "bg-gray-100 text-gray-700 border-gray-200",
          GRADUATED: "bg-blue-100 text-blue-700 border-blue-200",
          EXPELLED: "bg-red-100 text-red-700 border-red-200",
          WITHDRAWN: "bg-red-100 text-red-700 border-red-200",
          TRANSFERRED: "bg-red-100 text-red-700 border-red-200",
        };
        return statusConfig[status];
      };

      return (
        <Badge className={getStatusBadge(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    enableGlobalFilter: false,
    enableColumnFilter: false,
    cell: ({ row }) => {
      return (
        <DropdownOptions>
          <DropdownMenuItem asChild>
            <Link href={`/list/students/${row.original.id}`}>View student</Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <DeleteModal id={row.original.id} table="student">
              <span className="text-destructive px-2 py-1 text-sm font-medium">
                Delete Student
              </span>
            </DeleteModal>
          </DropdownMenuItem>
        </DropdownOptions>
      );
    },
  },
];
