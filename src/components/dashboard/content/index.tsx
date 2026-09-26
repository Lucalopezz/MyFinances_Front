"use client";

import DashboardHeader from "../dashboard-header";
import SummaryCards from "../summary-cards";
import MonthlyComparisonChart from "../monthly-comparison-chart";
import DashboardActions from "../dashboard-actions";
import type {
  FinancialSummary,
  DashboardForecast,
  MonthlyComparisonResponse,
} from "@/models/dashboard.model";
import { formatMonthLabel } from "@/utils/formatters";
import { ForecastCard } from "../forecast-card";
import { BudgetSection } from "../budget-section";
import type { MonthlyBudgetSummary } from "@/models/budget.model";

interface DashboardContentProps {
  dashboardData: FinancialSummary;
  monthlyComparison: MonthlyComparisonResponse;
  forecast?: DashboardForecast | null;
  forecastError?: string | null;
  budgetMonth: string;
  budgets?: MonthlyBudgetSummary[] | null;
  budgetError?: string | null;
}

const DashboardContent = ({
  dashboardData,
  monthlyComparison,
  forecast,
  forecastError,
  budgetMonth,
  budgets,
  budgetError,
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

      {forecast ? <ForecastCard forecast={forecast} /> : null}
      {forecastError ? <p role="alert" className="mb-6 rounded-lg border border-red-200 p-4 text-sm text-red-700 dark:border-red-900 dark:text-red-300">{forecastError}</p> : null}
      {budgets ? <BudgetSection initialMonth={budgetMonth} initialData={budgets} /> : null}
      {budgetError ? <p role="alert" className="mb-6 rounded-lg border border-red-200 p-4 text-sm text-red-700 dark:border-red-900 dark:text-red-300">{budgetError}</p> : null}

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
