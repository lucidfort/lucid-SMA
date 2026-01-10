"use client";

import Image from "next/image";
import React from "react";
import { RadialBarChart, RadialBar } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface CountChartProps {
  boys: number;
  girls: number;
}

const chartConfig = {
  boys: {
    label: "Boys",
    color: "var(--chart-2)",
  },
  girls: {
    label: "Girls",
    color: "var(--chart-1)",
  },
};

const CountChart = ({ boys, girls }: CountChartProps) => {
  const data = [
    {
      category: "total",
      count: boys + girls,
      fill: "white",
    },
    {
      category: "boys",
      count: boys,
      fill: chartConfig.boys.color,
    },
    {
      category: "girls",
      count: girls,
      fill: chartConfig.girls.color,
    },
  ];

  return (
    <div className="relative h-[90%] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <RadialBarChart
          data={data}
          innerRadius="45%"
          outerRadius="100%"
          barSize={32}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <ChartLegend
            content={
              <ChartLegendContent
                className="flex justify-center gap-16"
                nameKey="category"
              />
            }
          />
          <RadialBar background dataKey="count" />
        </RadialBarChart>
      </ChartContainer>

      <Image
        src="/maleFemale.svg"
        alt="male-female"
        width={50}
        height={50}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

export default CountChart;
