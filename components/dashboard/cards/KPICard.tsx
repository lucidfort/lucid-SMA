import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type TrendDirection = "up" | "down" | "neutral";

interface Props {
  title: string;
  value: number;
  change: number;
  trend: TrendDirection;
  icon: any;
  format?: "number" | "currency";
}

const KPICard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  format = "number",
}: Props) => {
  const formatValue = (val: number) => {
    if (format === "currency") {
      return `₦${val.toLocaleString()}`;
    }
    return val.toLocaleString();
  };

  const getTrendIcon = () => {
    if (trend === "up")
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down")
      return <TrendingDown className="text-destructive h-4 w-4" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-500";
    if (trend === "down") return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== 0 && (
          <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(change)}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
