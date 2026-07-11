"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_LABELS } from "@/constants/transaction-categories";
import type { CategorySpending } from "@/models/dashboard.model";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CategorySpendingChartProps {
  data: CategorySpending[];
  isLoading: boolean;
}

export default function CategorySpendingChart({
  data,
  isLoading,
}: CategorySpendingChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    name:
      CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] ??
      item.category,
  }));

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-xl text-[#1F2937] dark:text-white">
          Gastos por categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(320, data.length * 44)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(value) => formatCurrency(Number(value))} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip
                formatter={(value, _name, item) => [
                  `${formatCurrency(Number(value))} (${formatPercentage(item.payload.percentage)})`,
                  "Despesas",
                ]}
              />
              <Bar dataKey="total" name="Despesas" fill="#EF4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
