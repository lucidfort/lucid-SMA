"use client";

import { Pie, PieChart, ResponsiveContainer } from "recharts";

type PerformanceChartData = {
  name: string;
  value: number;
  fill: string;
}

const PerformanceChart = ({ data }: { data: PerformanceChartData[] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          dataKey="value"
          startAngle={180}
          endAngle={0}
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={68}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;
