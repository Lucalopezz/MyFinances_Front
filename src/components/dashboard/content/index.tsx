"use client";

import DashboardHeader from "../dashboard-header";
import SummaryCards from "../summary-cards";
import MonthlyComparisonChart from "../monthly-comparison-chart";
import DashboardActions from "../dashboard-actions";
import type {
  FinancialSummary,
  MonthlyComparisonResponse,
} from "@/actions/dashboard/dashboard";
import { formatMonthLabel } from "@/utils/formatters";

interface DashboardContentProps {
  dashboardData: FinancialSummary;
  monthlyComparison: MonthlyComparisonResponse;
}

const DashboardContent = ({
  dashboardData,
  monthlyComparison,
}: DashboardContentProps) => {
  const chartData = monthlyComparison.months.map((month) => ({
    name: formatMonthLabel(month.month),
    Receitas: month.totalIncomes,
    Despesas: month.totalExpenses,
    Saldo: month.balance,
  }));

  return (
    <div className="p-4 sm:p-6">
      <DashboardHeader period={dashboardData.period} />

      <SummaryCards
        balance={dashboardData.balance}
        totalIncomes={dashboardData.totalIncomes}
        totalExpenses={dashboardData.totalExpenses}
        economyRate={dashboardData.economyRate}
        highestSpendingCategory={dashboardData.highestSpendingCategory}
        periodStart={dashboardData.period.start}
        isLoading={false}
      />

      <MonthlyComparisonChart
        data={chartData}
        period={monthlyComparison.period}
        isLoading={false}
      />

      <DashboardActions />
    </div>
  );
};

export default DashboardContent;
