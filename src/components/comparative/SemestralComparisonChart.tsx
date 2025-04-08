import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SemesterComparisonChartProps {
  data: Array<{
    name: string;
    Receitas: number;
    Despesas: number;
  }>;
  isLoading: boolean;
}

const SemesterComparisonChart = ({
  data,
  isLoading,
}: SemesterComparisonChartProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-xl text-[#1F2937] dark:text-white">
          Comparativo Semestral
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 sm:h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="Receitas" fill="#10B981" />
              <Bar dataKey="Despesas" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default SemesterComparisonChart;
