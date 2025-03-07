"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";

import { useDashboard } from "@/hooks/queries/useDashboard";
import { useMonthlyComparison } from "@/hooks/queries/useMonthlyComparison";
import SummaryCards from "./SummaryCards";
import MonthlyComparisonChart from "./MonthlyComparisonChart";
import DashboardActions from "./DashboardActions";

const DashboardContent = ({ userId }: { userId: string }) => {
  // Hooks para buscar dados
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboard();

  const {
    data: monthlyData,
    isLoading: isMonthlyLoading,
    error: monthlyError,
  } = useMonthlyComparison(userId);

  // Exibir mensagem de erro caso ocorra
  if (dashboardError || monthlyError) {
    return (
      <div className="p-4 sm:p-6">
        <DashboardHeader />
        <div className="text-red-500">
          Erro: {dashboardError?.message || monthlyError?.message}
        </div>
      </div>
    );
  }

  // Dados para o gráfico
  const chartData = [
    {
      name: "Mês Anterior",
      Receitas: monthlyData?.previousMonth.totalIncomes || 0,
      Despesas: monthlyData?.previousMonth.totalExpenses || 0,
    },
    {
      name: "Mês Atual",
      Receitas: monthlyData?.currentMonth.totalIncomes || 0,
      Despesas: monthlyData?.currentMonth.totalExpenses || 0,
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      <DashboardHeader />
      
      <SummaryCards 
        balance={dashboardData?.balance || 0}
        totalIncomes={dashboardData?.totalIncomes || 0}
        totalExpenses={dashboardData?.totalExpenses || 0}
        isLoading={isDashboardLoading}
      />
      
      <MonthlyComparisonChart 
        data={chartData}
        isLoading={isMonthlyLoading}
      />
      
      <DashboardActions />
    </div>
  );
};

export default DashboardContent;