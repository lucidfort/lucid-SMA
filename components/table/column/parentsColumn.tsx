"use client";

import { Parent } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import DeleteModal from "@/components/dashboard/DeleteModal";
import FormModal from "@/components/form/ui/FormModal";
import { Checkbox } from "@/components/ui/checkbox";

export const parentsColumn: ColumnDef<Parent>[] = [
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
    accessorFn: (row) => `${row.name} ${row.surname}`,
    header: "Name",
    cell: ({ row: { original } }) => (
      <span>
        {original.name} {original.surname}
      </span>
    ),
  },
  {
    accessorKey: "primaryId",
    header: "Primary ID",
    cell: ({ row: { original } }) => <span>{original.primaryId || "-"}</span>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row: { original } }) => <span>{original.phone}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row: { original } }) => <span>{original?.email || "-"}</span>,
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row: { original } }) => <span>{original.address}</span>,
  },
  {
    accessorKey: "students",
    header: "Students",
    filterFn: (row, columnId, filterValue) => {
      const children = row.original.children
        .map((child) => child.student.name)
        .join(", ");
      return children.toLowerCase().includes(filterValue.toLowerCase());
    },
    cell: ({ row: { original } }) => (
      <span>
        {original.children.map((child) => child.student.name).join(", ")}{" "}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
      return (
        <DropdownOptions>
          <DropdownMenuItem asChild>
            <FormModal type="update" table="parent" data={original} />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <DeleteModal id={original.id} table="class" triggerTitle="Delete" />
          </DropdownMenuItem>
        </DropdownOptions>
      );
    },
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
  },
];
