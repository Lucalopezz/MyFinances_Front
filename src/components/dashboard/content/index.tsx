"use client";
import type { DailyProjection } from "@/models/calendar.model";

import DashboardHeader from "../dashboard-header";
import SummaryCards from "../summary-cards";
import DashboardActions from "../dashboard-actions";
import type { FinancialSummary } from "@/models/dashboard.model";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ForecastCard } from "../forecast-card";
import { BudgetSection } from "../budget-section";
import type { MonthlyBudgetSummary } from "@/models/budget.model";
import type { TransactionTotals } from "@/models/transaction.model";
import { TotalBalance } from "@/components/financial/total-balance";

interface DashboardContentProps {
  dashboardData: FinancialSummary;
  totalBalance?: TransactionTotals;
  forecast?: DailyProjection | null;
  forecastError?: string | null;
  budgetMonth: string;
  budgets?: MonthlyBudgetSummary[] | null;
  budgetError?: string | null;
}

const DashboardContent = ({
  dashboardData,
  totalBalance,
  forecast,
  forecastError,
  budgetMonth,
  budgets,
  budgetError,
}: DashboardContentProps) => {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <DashboardHeader period={dashboardData.period} />
        <DashboardActions />
      </div>

      <TotalBalance initialData={totalBalance} />

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
      {forecastError ? (
        <p
          role="alert"
          className="mb-6 rounded-lg border border-red-200 p-4 text-sm text-red-700 dark:border-red-900 dark:text-red-300"
        >
          {forecastError}
        </p>
      ) : null}
      {budgets ? (
        <BudgetSection initialMonth={budgetMonth} initialData={budgets} />
      ) : null}
      {budgetError ? (
        <p
          role="alert"
          className="mb-6 rounded-lg border border-red-200 p-4 text-sm text-red-700 dark:border-red-900 dark:text-red-300"
        >
          {budgetError}
        </p>
      ) : null}

      <Button asChild variant="outline">
        <Link href="/comparative">Ver evolução no comparativo</Link>
      </Button>
    </div>
  );
};

export default DashboardContent;
