"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCurrency,
  formatDateRange,
  formatMonthLabel,
  formatPercentage,
} from "@/utils/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyComparisonChartProps {
  data: Array<{
    name: string;
    Receitas: number;
    Despesas: number;
    Saldo?: number;
  }>;
  period: {
    start: string;
    end: string;
  };
  isLoading: boolean;
}

const MonthlyComparisonChart = ({
  data,
  period,
  isLoading,
}: MonthlyComparisonChartProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-xl text-[#1F2937] dark:text-white">
          Comparativo mensal
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Período {" "}
          {formatDateRange(period.start, period.end)}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 sm:h-64 w-full" />
        ) : (
          <>
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


          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyComparisonChart;
