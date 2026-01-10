"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface FinanceChartProps {
  data: {
    name: string;
    income: number;
    expense: number;
  }[];
}

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },
  expense: {
    label: "Expense",
    color: "var(--chart-2)",
  },
};

const FinanceChart = ({ data }: FinanceChartProps) => {
  return (
    <ChartContainer config={chartConfig} className="h-[90%] w-full">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 4" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tickMargin={10}
        />
        <YAxis axisLine={false} tickLine={false} tickMargin={20} />

        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend
          align="center"
          verticalAlign="top"
          content={<ChartLegendContent />}
        />

        <Line
          type="monotone"
          dataKey="income"
          stroke="#C3EBFA"
          strokeWidth={4}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#CFCEFF"
          strokeWidth={4}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default FinanceChart;
