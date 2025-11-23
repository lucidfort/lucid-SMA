"use client";

import MessageBoard from "@/components/MessageBoard";
import { Announcement } from "@/lib/generated/graphql/client";
import { ColumnDef } from "@tanstack/react-table";
import FormModal from "../FormModal";
import DropdownOptions from "../DropdownOptions";
import { isPast } from "date-fns";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import DeleteModal from "@/components/DeleteModal";

export const announcementsColumn: ColumnDef<Announcement>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row: { original } }) => (
      <MessageBoard
        type="announcement"
        title={original.title}
        description={original.content}
        date={new Intl.DateTimeFormat("en-NG").format(
          new Date(original.publishedAt),
        )}
        trigger={<span>{original.title}</span>}
      />
    ),
  },
  {
    accessorFn: (row) => row.grade?.name,
    header: "Class",
    cell: ({ row: { original } }) => (
      <span>{original?.grade?.name || "-"}</span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row: { original } }) => (
      <span>
        {new Intl.DateTimeFormat("en-CA").format(
          new Date(original.publishedAt),
        )}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
      const publishedAt = new Date(original.publishedAt);
      const isPresent = isPast(publishedAt);

      return (
        <DropdownOptions>
          <DropdownMenuItem asChild>
            <MessageBoard
              type="announcement"
              title={original.title}
              description={original.content}
              date={new Intl.DateTimeFormat("en-NG").format(
                new Date(original.publishedAt),
              )}
              trigger={<span className="pl-2">View</span>}
            />
          </DropdownMenuItem>

          {isPresent && (
            <DropdownMenuItem asChild>
              <FormModal table="announcement" type="update" data={original} />
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <DeleteModal
              id={original.id}
              table="announcement"
              triggerTitle={"Delete"}
            />
          </DropdownMenuItem>
        </DropdownOptions>
      );
    },
    meta: { roles: ["manager"] },
  },
];
