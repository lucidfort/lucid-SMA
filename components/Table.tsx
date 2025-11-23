import { cn } from "@/lib/utils";
import React from "react";

type TableProps = {
    columns: {
        header: string;
        accessor: string;
        cell: (item: any) => React.JSX.Element;
        className?: string;
    }[]
    data: any[];
}
const Table = ({
    columns,
    data,
}: TableProps) => {

    return (
        <div className="w-full overflow-x-scroll custom-scrollbar">
            <table className="w-full mt-4">
                <thead>
                    <tr className="text-left text-gray-500 text-sm bg-slate-100 rounded-lg">
                        {columns?.map((col) => (
                            <th key={col.accessor} className={cn("font-semibold text-base p-3 min-w-32 md:max-w-80", col.className)}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data?.length === 0 ? (
                        <tr>
                            <td colSpan={columns?.length} className="text-center py-8">No data available.</td>
                        </tr>
                    ) : (
                        data.map((item, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight h-16">
                                {columns?.map((col) => (
                                    <td key={col.accessor} className={cn("px-4 min-w-32 md:max-w-80", col.className)}>
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