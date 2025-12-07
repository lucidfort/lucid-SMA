"use client";

import { ColumnDef } from "@tanstack/react-table";
import FormModal from "@/components/FormModal";
import DeleteModal from "@/components/DeleteModal";
import DropdownOptions from "@/components/DropdownOptions";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Event } from "@/lib/generated/prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import MessageBoard from "../MessageBoard";

type EventsList = Event & { grade: { name: string } | null };

export const eventsColumn: ColumnDef<EventsList>[] = [
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
    accessorKey: "title",
    header: "Title",
    cell: ({ row: { original } }) => (
      <MessageBoard
        title={original.title}
        description={original.description || ""}
        date={original.startTime.toString()}
        type="event"
        trigger={original.title}
      />
    ),
  },
  {
    accessorFn: (row) => row.grade?.name || "grade",
    header: "Grade",
    cell: ({ row: { original } }) => <span>{original.grade?.name || "-"}</span>,
  },
  {
    accessorKey: "startTime",
    header: "Start Date",
    cell: ({ row: { original } }) => (
      <span>
        {format(new Date(original.startTime), "dd/MM/yyyy - hh:mm a")}
      </span>
    ),
  },
  {
    accessorKey: "endTime",
    header: "Ends",
    cell: ({ row: { original } }) => (
      <span>
        {original?.endTime ? format(new Date(original.endTime), "dd/MM/yyyy - hh:mm a") : "-"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
      return (
        <DropdownOptions>
          <DropdownMenuItem asChild>
            <FormModal
              table="event"
              type="update"
              data={original}
              triggerTitle="Update"
            />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <DeleteModal id={original.id} table="staff" triggerTitle="Delete" />
          </DropdownMenuItem>
        </DropdownOptions>
      );
    },
  },
];
