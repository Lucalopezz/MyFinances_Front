import DashboardContent from "@/components/dashboard/content";
import { getDashboardSummary } from "@/actions/dashboard/dashboard";
import { getFinancialCalendar } from "@/actions/calendar/calendar";
import { currentDay } from "@/components/calendar/calendar-utils";
import { getBudgetSummary } from "@/actions/budget/budgets";

async function loadForecast() {
  try {
    return {
      data: (await getFinancialCalendar(currentDay().slice(0, 7))).projection,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a projeção do mês.",
    };
  }
}

async function loadBudgets(month: string) {
  try {
    return { data: await getBudgetSummary(month), error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os orçamentos.",
    };
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const budgetMonth = new Date().toISOString().slice(0, 7);
  const [dashboardData, forecast, budgets] = await Promise.all([
    getDashboardSummary(),
    loadForecast(),
    loadBudgets(budgetMonth),
  ]);

  return (
    <DashboardContent
      dashboardData={dashboardData}
      forecast={forecast.data}
      forecastError={forecast.error}
      budgetMonth={budgetMonth}
      budgets={budgets.data}
      budgetError={budgets.error}
    />
  );
}
