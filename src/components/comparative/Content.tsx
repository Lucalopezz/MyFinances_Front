import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import SemesterComparisonChart from "@/components/comparative/SemestralComparisonChart";
import TrendLineChart from "@/components/comparative/TrendLineChart";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { SixMonthComparisonItem } from "@/services/dashboard.service";

interface ComparativeContentProps {
  sixMonthData: SixMonthComparisonItem[];
}

export default function ComparativeContent({
  sixMonthData,
}: ComparativeContentProps) {
  const chartData = sixMonthData.map((month) => ({
    name: month.label,
    Receitas: month.totalIncomes,
    Despesas: month.totalExpenses,
  }));

  const trendData = sixMonthData.map((month) => ({
    name: month.label,
    Receitas: month.totalIncomes,
    Despesas: month.totalExpenses,
    Saldo: month.totalIncomes - month.totalExpenses,
  }));

  const totalIncome = sixMonthData.reduce(
    (sum, month) => sum + month.totalIncomes,
    0,
  );
  const totalExpenses = sixMonthData.reduce(
    (sum, month) => sum + month.totalExpenses,
    0,
  );

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
        Análise Comparativa Semestral
      </h1>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total de Receitas
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalIncome)}
                </h3>
              </div>
              <div className="rounded-full bg-green-100 p-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total de Despesas
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalExpenses)}
                </h3>
              </div>
              <div className="rounded-full bg-red-100 p-2">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SemesterComparisonChart data={chartData} isLoading={false} />
        <TrendLineChart data={trendData} isLoading={false} />
      </div>
    </div>
  );
}
