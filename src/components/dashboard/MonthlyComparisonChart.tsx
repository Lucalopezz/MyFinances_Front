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
  bestMonth?: {
    month: string;
    balance: number;
    economyRate?: number;
  } | null;
  worstMonth?: {
    month: string;
    balance: number;
    economyRate?: number;
  } | null;
  period: {
    start: string;
    end: string;
  };
  isLoading: boolean;
}

const MonthlyComparisonChart = ({
  data,
  bestMonth,
  worstMonth,
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
          Meses retornados pela API no período{" "}
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

            {(bestMonth || worstMonth) && (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {bestMonth && (
                  <div className="rounded-lg border border-green-100 bg-green-50 p-3 dark:border-green-800/50 dark:bg-green-800/30">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Melhor mês do período
                    </p>
                    <p className="font-semibold text-[#1F2937] dark:text-white">
                      {formatMonthLabel(bestMonth.month)}
                    </p>
                    <p className="text-sm text-[#10B981]">
                      {formatCurrency(bestMonth.balance)} de saldo
                      {bestMonth.economyRate !== undefined &&
                        ` - ${formatPercentage(bestMonth.economyRate)} de economia`}
                    </p>
                  </div>
                )}

                {worstMonth && (
                  <div className="rounded-lg border border-red-100 bg-red-50 p-3 dark:border-red-800/50 dark:bg-red-800/30">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pior mês do período
                    </p>
                    <p className="font-semibold text-[#1F2937] dark:text-white">
                      {formatMonthLabel(worstMonth.month)}
                    </p>
                    <p className="text-sm text-[#EF4444]">
                      {formatCurrency(worstMonth.balance)} de saldo
                      {worstMonth.economyRate !== undefined &&
                        ` - ${formatPercentage(worstMonth.economyRate)} de economia`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyComparisonChart;
