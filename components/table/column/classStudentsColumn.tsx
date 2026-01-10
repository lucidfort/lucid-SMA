"use client";

import Image from "next/image";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Student, StudentStatus } from "@/lib/generated/graphql/client";
import { Badge } from "@/components/ui/badge";
import { calculateAge } from "@/lib/utils/client.utils";
import { format } from "date-fns";

export const classStudentsColumn: ColumnDef<Student>[] = [
  {
    header: "Student",
    accessorFn: (row) => row.name + " " + row.surname,
    cell: ({ row: { original } }) => (
      <span className="flex items-center gap-4">
        <Image
          src={original?.img || "/noAvatar.png"}
          alt="student"
          width={40}
          height={40}
          className="h-10 w-10 rounded-full"
        />
        <h3 className="font-semibold">
          {original.name} {original.surname}
        </h3>
      </span>
    ),
  },
  {
    header: "Reg No",
    accessorKey: "registrationNumber",
    cell: ({ row: { original } }) => <span>{original.registrationNumber}</span>,
  },
  {
    header: "Gender",
    accessorKey: "sex",
    cell: ({ row: { original } }) => (
      <span className="capitalize">{original.sex[0]}</span>
    ),
  },
  {
    header: "Birthday",
    accessorKey: "birthday",
    cell: ({ row: { original } }) => {
      const birthday = new Date(original.birthday);

      return (
        <span>
          {format(birthday, "dd/MM/ yyyy")} - ({calculateAge(birthday)} years)
        </span>
      );
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    enableGlobalFilter: false,
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
    cell: ({ row: { original } }) => (
      <DropdownOptions>
        <DropdownMenuItem>
          <Link href={`/list/students/${original.id}`}>
            <span>View student</span>
          </Link>
        </DropdownMenuItem>
      </DropdownOptions>
    ),
    meta: { roles: ["manager"] },
    enableHiding: false,
    enableGlobalFilter: false,
    enableSorting: false,
  },
];
