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
import { Button } from "../../ui/button";
import ListHeader from "@/components/table/ListHeader";
import { DataTableProps } from "@/types";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export function DataTable({
  columns,
  data,
  accessLevel,
  filters,
  pagination,
  ...props
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState<any>([]);

  const router = useRouter();

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
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const { selectCount = true, ...filterOptions } = filters ?? {};

  const onBack = () => {
    if (table.getCanPreviousPage()) {
      table.previousPage();
      return;
    }

    if (pagination?.page) {
      const params = new URLSearchParams(window.location.search);

      const prevPage = Number(pagination?.page) - 1;

      params.set("page", prevPage.toString());
      router.push(`?${params.toString()}`);
    }
  };

  const onNext = () => {
    if (table.getCanNextPage()) {
      table.nextPage();
      return;
    }

    if (pagination?.page) {
      const params = new URLSearchParams(window.location.search);
      const nextPage = Number(pagination?.page) + 1;

      params.set("page", nextPage.toString());
      router.push(`?${params.toString()}`);
    }
  };

  const canGoBackClient = table.getCanPreviousPage();
  const canGoBackServer = pagination && Number(pagination.page) > 1;

  return (
    <Card>
      <CardHeader>
        <ListHeader
          table={table}
          globalFilter={globalFilter}
          accessLevel={accessLevel}
          filters={filterOptions}
          {...props}
        />
      </CardHeader>

      <CardContent>
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
                    className="hover:bg-lamaPurpleLight text-sm even:bg-slate-50"
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
      </CardContent>

      <CardFooter>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            disabled={!canGoBackClient && !canGoBackServer}
          >
            Previous
          </Button>

          {selectCount && (
            <div className="text-muted-foreground flex-1 text-sm">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!table.getCanNextPage() && !pagination?.hasNextPage}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
