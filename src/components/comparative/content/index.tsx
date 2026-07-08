import SummaryCard from "@/components/summary-card";
import { formatCurrency } from "@/utils/formatters";
import SemesterComparisonChart from "../semestral-comparison-chart";
import TrendLineChart from "../trend-line-chart";
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
  const summaryCards = [
    {
      title: "Total de Receitas",
      content: formatCurrency(totalIncome),
      icon: (
        <div className="rounded-full bg-green-100 p-2">
          <TrendingUp className="h-6 w-6 text-green-600" />
        </div>
      ),
    },
    {
      title: "Total de Despesas",
      content: formatCurrency(totalExpenses),
      icon: (
        <div className="rounded-full bg-red-100 p-2">
          <TrendingDown className="h-6 w-6 text-red-600" />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
        Análise Comparativa Semestral
      </h1>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} layout="inline" {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SemesterComparisonChart data={chartData} isLoading={false} />
        <TrendLineChart data={trendData} isLoading={false} />
      </div>
    </div>
  );
}
