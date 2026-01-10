"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useMemo } from "react";

interface Result {
  results: {
    studentScore: number;
  }[];
  maxScore: number;
}

const chartConfig = {
  count: {
    label: "Students",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const ScoreDistributionChart = ({ results, maxScore }: Result) => {
  const prepareData = (
    results: { studentScore: number }[],
    maxScore: number,
    binSize = 10,
  ) => {
    const bins: Record<string, number> = {};

    for (let start = 0; start < maxScore; start += binSize) {
      const end = start + binSize - 1;
      const label = `${start}-${Math.min(end, maxScore)}`;
      bins[label] = 0;
    }

    results.forEach(({ studentScore }) => {
      const binStart = Math.floor(studentScore / binSize) * binSize;
      const binEnd = binStart + binSize - 1;
      const label = `${binStart}-${Math.min(binEnd, maxScore)}`;
      if (bins[label] !== undefined) bins[label]++;
    });

    return Object.entries(bins).map(([range, count]) => ({ range, count }));
  };

  const chartData = useMemo(
    () => prepareData(results, maxScore, 10),
    [results, maxScore],
  );

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="range" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
};
export default ScoreDistributionChart;
