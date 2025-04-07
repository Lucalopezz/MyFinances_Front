"use client";

import SemesterComparisonChart from "@/components/comparative/SemestralComparisonChart";
import { useSixMonthComparison } from "@/hooks/queries/useSixMonthComparison";


export default function Comparative() {
  const {
    data: sixMonthData,
    isLoading,
    error,
  } = useSixMonthComparison();

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-red-500">
          Erro ao carregar dados de comparação semestral
        </div>
      </div>
    );
  }

  const chartData = sixMonthData?.map(month => ({
    name: month.label,
    Receitas: month.totalIncomes,
    Despesas: month.totalExpenses,
  })) || [];

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Comparativo dos Últimos 6 Meses
      </h1>
      
      <SemesterComparisonChart
        data={chartData}
        isLoading={isLoading}
      />
    </div>
  );
}