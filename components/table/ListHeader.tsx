import FormModal from "@/components/form/ui/FormModal";
import TermSelector from "@/components/TermSelector";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { listCreationAccess } from "@/lib/settings";
import { DataTableProps } from "@/types";
import { type Table } from "@tanstack/table-core";
import { MoreHorizontal, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { CardTitle } from "@/components/ui/card";

interface ListHeaderProps
  extends Omit<DataTableProps, "columns" | "data" | "paginate"> {
  table: Table<any>;
  globalFilter: any;
}

const ListHeader = ({
  table,
  tableFor,
  title,
  globalFilter,
  accessLevel,
  filters,
  relatedData,
}: ListHeaderProps) => {
  const {
    termFilter = false,
    listCreation = true,
    sortFilter = true,
  } = filters ?? {};

  return (
    <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
      {title && (
        <CardTitle className="text-center text-lg font-semibold capitalize">
          {title}
        </CardTitle>
      )}

      <div className="flex flex-col gap-2 md:ml-auto md:flex-row md:items-center">
        <div className="relative flex max-w-md flex-1 items-center rounded-full px-2 py-1 text-xs ring-[1.5px] ring-gray-300">
          <Search size={16} />
          <Input
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            className="h-full flex-1 rounded-full border-none bg-transparent shadow-none outline-none focus-visible:border-0 focus-visible:ring-0"
          />
        </div>

        {termFilter && <TermSelector />}

        <div className="flex items-end justify-end gap-2">
          {sortFilter && (
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className="bg-lamaYellow flex h-8 w-8 items-center justify-center rounded-full border-0 p-2"
              >
                <Image src="/sort.svg" alt="sort" width={12} height={12} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {listCreation &&
            listCreationAccess[accessLevel]?.includes(tableFor) && (
              <FormModal
                table={tableFor}
                type="create"
                relatedData={relatedData}
              >
                <button className="flex-center bg-lamaYellow size-8 rounded-full">
                  <Image
                    src="/create.svg"
                    alt="create"
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                </button>
              </FormModal>
            )}

          {table.getFilteredSelectedRowModel().rows.length > 0 &&
            accessLevel === "manager" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`bg-lamaYellow rounded-full`}
                  >
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
        </div>
      </div>
    </div>
  );
};

export default ListHeader;
