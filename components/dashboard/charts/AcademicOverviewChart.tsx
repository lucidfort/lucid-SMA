"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { term: "Term 1", score: 82 },
  { term: "Term 2", score: 84 },
  { term: "Term 3", score: 87 },
  { term: "Current", score: 87.5 },
];

const chartConfig = {
  score: {
    label: "Average Score",
    color: "hsl(var(--primary))",
  },
};

const AcademicOverviewChart = () => {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="term" className="text-xs" />
        <YAxis className="text-xs" domain={[70, 100]} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--color-score)"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default AcademicOverviewChart;
