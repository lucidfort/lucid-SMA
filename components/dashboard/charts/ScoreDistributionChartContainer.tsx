import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ScoreDistributionChart from "@/components/dashboard/charts/ScoreDistributionChart";

interface Props {
  results: {
    studentScore: number;
  }[];
  maxScore: number;
}

const ScoreDistributionChartContainer = ({ ...props }: Props) => {
  return (
    <Card className="h-[400px] border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Score Distribution</CardTitle>
        <CardDescription>
          Number of students in each score range
        </CardDescription>
      </CardHeader>
      <CardContent className="relative h-[90%] w-full">
        <ScoreDistributionChart {...props} />
      </CardContent>
    </Card>
  );
};
export default ScoreDistributionChartContainer;
