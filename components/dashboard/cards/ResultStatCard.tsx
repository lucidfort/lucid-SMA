"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/client.utils";
import { Progress } from "@/components/ui/progress";

interface Props {
  maxScore: number;
  results: {
    studentId: string;
    studentName: string;
    studentScore: number;
  }[];
  passMarkPercentage?: number;
}

const ResultStatCard = ({
  maxScore,
  results,
  passMarkPercentage = 50,
}: Props) => {
  const stats = useMemo(() => {
    if (!results.length || maxScore <= 0) {
      return {
        passed: 0,
        failed: 0,
        avgScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
        total: 0,
      };
    }

    const percentages = results.map((r) =>
      Math.round((r.studentScore / maxScore) * 100),
    );

    const passed = percentages.filter((p) => p > passMarkPercentage).length;

    const failed = results.length - passed;

    const avgScore = Math.round(
      percentages.reduce((sum, p) => sum + p, 0) / percentages.length,
    );
    const highestScore = Math.max(...percentages);
    const lowestScore = Math.min(...percentages);

    const passRate = Math.round((passed / results.length) * 100);

    return {
      passed,
      failed,
      avgScore,
      highestScore,
      lowestScore,
      passRate,
      total: results.length,
    };
  }, [results, maxScore, passMarkPercentage]);

  const cards = [
    {
      label: "Participants",
      description: "Total students",
      value: stats.total,
    },
    {
      label: "Pass Rate",
      description: `${stats.passed} passed`,
      value: `${stats.passRate}%`,
      className: "text-green-600",
    },
    {
      label: "Average Score",
      value: `${stats.avgScore}%`,
      component: <Progress value={stats.avgScore} className="mt-2" />,
      className: "text-blue-600",
    },
    {
      label: "Highest Score",
      description: "Highest Performer",
      value: `${stats.highestScore}%`,
      className: "text-emerald-600",
    },
    {
      label: "Lowest Score",
      description: "Needs Support",
      value: `${stats.lowestScore}%`,
      className: "text-red-600",
    },
    {
      label: "Failed",
      description: `${Math.round((stats.failed / stats.total) * 100)}% of class`,
      value: `${stats.failed}%`,
      className: "text-red-500",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="max-w-56 min-w-44 flex-1 border-0 shadow-sm"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", card.className)}>
              {card.value}
            </div>

            {card.description && (
              <p className="text-muted-foreground text-xs">
                {card.description}
              </p>
            )}

            {card.component && card.component}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
export default ResultStatCard;
