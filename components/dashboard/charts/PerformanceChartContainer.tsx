import dynamic from "next/dynamic";
import Image from "next/image";

const PerformanceChart = dynamic(() => import("./PerformanceChart"), {
  loading: () => <h1>Loading...</h1>,
});

type NormalizedResult = {
  score: number;
  maxScore: number;
};

interface Props {
  results: (
    | {
        __typename?: "AssessmentResult" | undefined;
        id: string;
        score: number;
        assignment: {
          __typename?: "Assessment" | undefined;
          maxScore: number;
        };
      }
    | {
        __typename?: "ExamResult" | undefined;
        id: string;
        score: number;
        exam: {
          __typename?: "Exam" | undefined;
          maxScore: number;
        };
      }
  )[];
}

const PerformanceChartContainer = ({ results }: Props) => {
  const normalizedResults: NormalizedResult[] = results.map((r) => {
    switch (r.__typename) {
      case "ExamResult":
        return { score: r.score, maxScore: r.exam.maxScore };
      case "AssessmentResult":
        return { score: r.score, maxScore: r.assignment.maxScore };
      default:
        return { score: 0, maxScore: 0 };
    }
  });

  const totalScore = normalizedResults.reduce((sum, r) => sum + r.score, 0);

  const totalMaxScore = normalizedResults.reduce(
    (sum, r) => sum + r.maxScore,
    0,
  );

  const performance = totalMaxScore ? (totalScore / totalMaxScore) * 10 : 0.1;

  const chartData = [
    { name: "Overall", value: performance * 100, fill: "#C3EBFA" },
    { name: "Total", value: (10 - performance) * 100, fill: "#FAE27C" },
  ];

  return (
    <div className="relative h-80 rounded-md bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Performance</h2>
        <Image src="/moreDark.svg" alt="" width={16} height={16} />
      </div>

      <PerformanceChart data={chartData} />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center">
        <p className="text-3xl font-bold">{performance.toFixed(1)}</p>
        <p className="text-xs text-gray-300">of 10 max GPI</p>
      </div>

      <h3 className="absolute right-0 bottom-16 left-0 m-auto text-center font-medium">
        Assignments & Exams
      </h3>
    </div>
  );
};

export default PerformanceChartContainer;
