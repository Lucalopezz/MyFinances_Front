"use client";

import { useSixMonthComparison } from "@/hooks/queries/useSixMonthComparison";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import SemesterComparisonChart from "@/components/comparative/SemestralComparisonChart";
import TrendLineChart from "@/components/comparative/TrendLineChart";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function Comparative() {
  const { data: sixMonthData, isLoading, error } = useSixMonthComparison();

  // Exibir mensagem de erro caso ocorra
  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-red-500">
          Erro ao carregar dados de comparação semestral
        </div>
      </div>
    );
  }

  // Formatar os dados para os gráficos
  const chartData =
    sixMonthData?.map((month) => ({
      name: month.label,
      Receitas: month.totalIncomes,
      Despesas: month.totalExpenses,
    })) || [];

  // Adicionar o saldo (Receitas - Despesas) para o gráfico de linha
  const trendData =
    sixMonthData?.map((month) => ({
      name: month.label,
      Receitas: month.totalIncomes,
      Despesas: month.totalExpenses,
      Saldo: month.totalIncomes - month.totalExpenses,
    })) || [];

  const calculateMetrics = () => {
    if (!sixMonthData || sixMonthData.length === 0) return null;

    const totalIncome = sixMonthData.reduce(
      (sum, month) => sum + month.totalIncomes,
      0
    );
    const totalExpenses = sixMonthData.reduce(
      (sum, month) => sum + month.totalExpenses,
      0
    );

    return {
      totalIncome,
      totalExpenses,
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Análise Comparativa Semestral
      </h1>

      {/* Métricas resumidas */}
      {!isLoading && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total de Receitas
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(metrics.totalIncome)}
                  </h3>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
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
                    {formatCurrency(metrics.totalExpenses)}
                  </h3>
                </div>
                <div className="p-2 bg-red-100 rounded-full">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SemesterComparisonChart data={chartData} isLoading={isLoading} />

        <TrendLineChart data={trendData} isLoading={isLoading} />
      </div>
    </div>
  );
}
