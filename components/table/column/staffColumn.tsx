"use client";

import Image from "next/image";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import DeleteModal from "@/components/dashboard/DeleteModal";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import { Staff } from "@/lib/generated/graphql/client";
import FormModal from "@/components/form/ui/FormModal";
import DeactivateUserDialog from "@/components/dashboard/DeactivateUserDialog";

export const staffColumn: ColumnDef<Staff>[] = [
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
    header: "Name",
    id: "info",
    cell: ({ row: { original } }) => (
      <div className="flex items-center gap-4 p-2">
        <Image
          src={original.img || "/noAvatar.png"}
          alt={original.name}
          width={100}
          height={100}
          className="size-10 rounded-full"
        />
        <h3 className="font-semibold">
          {original.name} {original.surname}
        </h3>
      </div>
    ),
  },
  {
    header: "EmployeeId",
    accessorKey: "employeeId",
    cell: ({ row: { original } }) => <span>{original.employeeId}</span>,
  },
  {
    header: "Phone",
    accessorKey: "phone",
    cell: ({ row: { original } }) => <span>{original.phone}</span>,
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: ({ row: { original } }) => <span>{original.email}</span>,
  },
  {
    header: "Address",
    accessorKey: "address",
    cell: ({ row: { original } }) => <span>{original.address}</span>,
  },
  {
    header: "Class",
    accessorFn: (row) =>
      row?.assignedClass?.map((item) => item.class.grade.name).join(", "),
    cell: ({ row: { original } }) => {
      const classes = original.assignedClass
        ?.map((item) => `${item.class.grade.name} ${item.class.name}`)
        .join(", ");

      return <span>{classes}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
      return (
        <DropdownOptions>
          <DropdownMenuItem asChild>
            <Link
              href={`/list/staffs/${original.id}`}
              className="cursor-pointer"
            >
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <FormModal table="staff" type="update" data={original} />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {original.clerkUserId && (
            <DeactivateUserDialog
              type={"staff"}
              userId={original.id}
              activate={!original.isActive}
            />
          )}

          <DropdownMenuItem asChild>
            <DeleteModal id={original.id} table="staff" triggerTitle="Delete" />
          </DropdownMenuItem>
        </DropdownOptions>
      );
    },
    meta: { roles: ["manager"] },
  },
];
