"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  present: {
    label: "Present",
    color: "var(--chart-1)",
  },
  absent: {
    label: "Absent",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type AttendanceData = { name: string; present: number; absent: number };

const AttendanceChart = ({ data }: { data: AttendanceData[] }) => {
  return (
    <div className="relative h-[90%] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart data={data} barSize={20}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-muted"
          />

          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />

          <ChartTooltip content={<ChartTooltipContent />} />

          <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />

          <Bar
            dataKey="present"
            fill="var(--color-present)"
            radius={[8, 8, 0, 0]}
          />

          <Bar
            dataKey="absent"
            fill="var(--color-absent)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default AttendanceChart;
