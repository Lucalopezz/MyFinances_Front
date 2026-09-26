import DashboardContent from "@/components/dashboard/content";
import {
  getDashboardSummary,
  getMonthlyComparison,
} from "@/actions/dashboard/dashboard";
import { getDashboardForecast } from "@/actions/dashboard/forecast";
import { getBudgetSummary } from "@/actions/budget/budgets";

async function loadForecast() {
  try {
    return { data: await getDashboardForecast(), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Não foi possível carregar a projeção do mês.",
    };
  }
}

async function loadBudgets(month: string) {
  try {
    return { data: await getBudgetSummary(month), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Não foi possível carregar os orçamentos.",
    };
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const budgetMonth = new Date().toISOString().slice(0, 7);
  const [dashboardData, monthlyComparison, forecast, budgets] = await Promise.all([
    getDashboardSummary(),
    getMonthlyComparison(),
    process.env.DASHBOARD_FORECAST_ENABLED === "true"
      ? loadForecast()
      : Promise.resolve({ data: null, error: null }),
    process.env.MONTHLY_BUDGETS_ENABLED === "true"
      ? loadBudgets(budgetMonth)
      : Promise.resolve({ data: null, error: null }),
  ]);

  return (
    <DashboardContent
      dashboardData={dashboardData}
      monthlyComparison={monthlyComparison}
      forecast={forecast.data}
      forecastError={forecast.error}
      budgetMonth={budgetMonth}
      budgets={budgets.data}
      budgetError={budgets.error}
    />
  );
}
