import { cn } from "@/lib/utils/client.utils";
import React from "react";

type TableProps = {
  columns: {
    header: string;
    accessor?: string;
    cell: (item: any) => React.JSX.Element;
    className?: string;
  }[];
  data: any[];
};
const Table = ({ columns, data }: TableProps) => {
  return (
    <div className="custom-scrollbar w-full overflow-x-scroll">
      <table className="w-full">
        <thead>
          <tr className="rounded-lg bg-slate-100 text-left text-sm text-gray-500">
            {columns?.map((col) => (
              <th
                key={col.accessor || col.header}
                className={cn(
                  "min-w-32 p-3 text-base font-semibold md:max-w-80",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.length === 0 ? (
            <tr>
              <td colSpan={columns?.length} className="py-8 text-center">
                No data available.
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-lamaPurpleLight h-16 border-b border-gray-200 text-sm even:bg-slate-50"
              >
                {columns?.map((col) => (
                  <td
                    key={col.accessor || col.header}
                    className={cn("min-w-32 px-4 md:max-w-80", col.className)}
                  >
                    {col.cell(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
