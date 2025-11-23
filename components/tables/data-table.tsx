"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useState } from "react";
import { Button } from "../ui/button";
import ListHeader from "@/components/ListHeader";
import { DataTableProps } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";

export function DataTable({
  columns,
  data,
  accessLevel,
  filters,
  paginate,
  ...props
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState<any>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) ?? 1;

  const filteredColumns = columns.filter((col) => {
    return col.meta?.roles ? col.meta.roles.includes(accessLevel) : true;
    // const programCheck = col.meta?.programs ? col.meta.programs.includes(programs?.flatMap(a => a)) : true

    // return roleCheck && programCheck
  });

  const table = useReactTable({
    data,
    columns: filteredColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const { selectCount = true, ...filterOptions } = filters ?? {};

  return (
    <div className="flex flex-col gap-3">
      <ListHeader
        table={table}
        globalFilter={globalFilter}
        accessLevel={accessLevel}
        filters={filterOptions}
        {...props}
      />

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="space-x-5 rounded-lg bg-slate-100"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="flex-1 p-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="text-sm even:bg-slate-50 hover:bg-lamaPurpleLight"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="flex-1 pr-16 pl-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>

        {selectCount && (
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.nextPage();

            if (paginate) {
              router.push(`?page=${page - 1}`);
            }
          }}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
