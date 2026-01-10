import dynamic from "next/dynamic";
import { AttendanceStatus } from "@/lib/generated/graphql/server";
import Image from "next/image";
import { AttendanceRange } from "@/types";
import { aggregateAttendance } from "@/lib/utils/client.utils";

const AttendanceChart = dynamic(() => import("./AttendanceChart"), {
  loading: () => <h1>Loading...</h1>,
});

interface Props {
  data: {
    date: string;
    status: AttendanceStatus;
  }[];
  range?: AttendanceRange;
  title?: string;
}

const AttendanceChartContainer = ({ data, range = "WEEKLY", title }: Props) => {
  const formattedData = aggregateAttendance(data, range);

  return (
    <div className="h-full w-full space-y-7 rounded-xl bg-white p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{title || "Attendance"}</h1>
        <Image src="/moreDark.svg" alt="more" width={20} height={20} />
      </div>

      <AttendanceChart data={formattedData} />
    </div>
  );
};

export default AttendanceChartContainer;
