import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Table } from "@tanstack/table-core";
import DropdownOptions from "@/components/DropdownOptions";
import { DataTableProps } from "@/types";
import TermSelector from "@/components/TermSelector";
import FormModal from "@/components/FormModal";
import { listCreationAccess } from "@/lib/settings";

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
  termFilter,
  filters,
  relatedData,
}: ListHeaderProps) => {
  const { termFilter: showTermFilter = false, listCreation = true } =
    filters ?? {};

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      {title && (
        <h1 className="text-center text-lg font-semibold capitalize">
          {title}
        </h1>
      )}

      <div className="flex w-full flex-col gap-2 md:w-[32%] md:flex-row md:items-center">
        <div className="relative flex flex-1 items-center rounded-full px-2 py-1 text-xs ring-[1.5px] ring-gray-300">
          <Search size={16} />
          <Input
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            className="h-full flex-1 rounded-full border-none bg-transparent shadow-none outline-none focus-visible:border-0 focus-visible:ring-0"
          />
        </div>

        <div className="flex items-end justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-lamaYellow p-2"
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

          {listCreation &&
            listCreationAccess[accessLevel]?.includes(tableFor) && (
              <FormModal
                table={tableFor}
                type="create"
                relatedData={relatedData}
              >
                <button className="flex-center size-8 rounded-full bg-lamaYellow">
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

          {showTermFilter && termFilter && <TermSelector {...termFilter} />}

          {table.getFilteredSelectedRowModel().rows.length > 0 &&
            (accessLevel === "manager" || accessLevel === "administration") && (
              <DropdownOptions triggerClassName="bg-lamaYellow">
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </DropdownOptions>
            )}
        </div>
      </div>
    </div>
  );
};

export default ListHeader;
