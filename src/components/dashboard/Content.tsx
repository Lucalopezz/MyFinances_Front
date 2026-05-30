"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "./SummaryCards";
import MonthlyComparisonChart from "./MonthlyComparisonChart";
import DashboardActions from "./DashboardActions";
import type {
  FinancialSummary,
  MonthlyComparisonDto,
} from "@/services/dashboard.service";

interface DashboardContentProps {
  dashboardData: FinancialSummary;
  monthlyComparison: {
    currentMonth: MonthlyComparisonDto;
    previousMonth: MonthlyComparisonDto;
  };
}

const DashboardContent = ({
  dashboardData,
  monthlyComparison,
}: DashboardContentProps) => {
  const chartData = [
    {
      name: "Mês Anterior",
      Receitas: monthlyComparison.previousMonth.totalIncomes,
      Despesas: monthlyComparison.previousMonth.totalExpenses,
    },
    {
      name: "Mês Atual",
      Receitas: monthlyComparison.currentMonth.totalIncomes,
      Despesas: monthlyComparison.currentMonth.totalExpenses,
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      <DashboardHeader />

      <SummaryCards
        balance={dashboardData.balance}
        totalIncomes={dashboardData.totalIncomes}
        totalExpenses={dashboardData.totalExpenses}
        isLoading={false}
      />

      <MonthlyComparisonChart data={chartData} isLoading={false} />

      <DashboardActions />
    </div>
  );
};

export default DashboardContent;
