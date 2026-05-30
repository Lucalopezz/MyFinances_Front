import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import { unstable_noStore as noStore } from "next/cache";

export interface FinancialSummary {
  balance: number;
  totalIncomes: number;
  totalExpenses: number;
  period: {
    start: string;
    end: string;
  };
}

export interface MonthlyComparisonDto {
  month: string;
  totalExpenses: number;
  totalIncomes: number;
  percentageChange?: number;
}

export interface SixMonthComparisonItem extends MonthlyComparisonDto {
  label: string;
}

export async function getDashboardSummary(): Promise<FinancialSummary> {
  noStore();

  const backendUrl = getServerBackendUrl();
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-01-01`;
  const endDate = `${currentYear}-12-31`;
  const token = await getServerToken();

  const emptySummary: FinancialSummary = {
    balance: 0,
    totalIncomes: 0,
    totalExpenses: 0,
    period: {
      start: startDate,
      end: endDate,
    },
  };

  if (!token) {
    return emptySummary;
  }

  try {
    const response = await fetch(
      `${backendUrl}/dashboard/?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: createJsonHeaders(token),
        cache: "no-store",
        next: { tags: ["dashboard"] },
      },
    );

    if (!response.ok) {
      return emptySummary;
    }

    return response.json();
  } catch (error) {
    return emptySummary;
  }
}

export async function getMonthlyComparison(): Promise<{
  currentMonth: MonthlyComparisonDto;
  previousMonth: MonthlyComparisonDto;
}> {
  noStore();

  const backendUrl = getServerBackendUrl();
  const token = await getServerToken();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const currentStartDate = new Date(currentYear, currentMonthIndex, 1);
  const currentEndDate = new Date(currentYear, currentMonthIndex + 1, 0);

  const previousMonthIndex =
    currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const previousYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;
  const previousStartDate = new Date(previousYear, previousMonthIndex, 1);
  const previousEndDate = new Date(previousYear, previousMonthIndex + 1, 0);

  const buildDefaultComparison = (date: Date): MonthlyComparisonDto => ({
    month: date.toISOString().split("T")[0].slice(0, 7),
    totalExpenses: 0,
    totalIncomes: 0,
  });

  if (!token) {
    return {
      currentMonth: buildDefaultComparison(currentStartDate),
      previousMonth: buildDefaultComparison(previousStartDate),
    };
  }

  try {
    const [currentResponse, previousResponse] = await Promise.all([
      fetch(
        `${backendUrl}/dashboard/monthly-comparison?startDate=${currentStartDate.toISOString().split("T")[0]}&endDate=${currentEndDate.toISOString().split("T")[0]}`,
        {
          headers: createJsonHeaders(token),
          next: { tags: ["monthlyComparison"] },
          cache: "no-store",
        },
      ),
      fetch(
        `${backendUrl}/dashboard/monthly-comparison?startDate=${previousStartDate.toISOString().split("T")[0]}&endDate=${previousEndDate.toISOString().split("T")[0]}`,
        {
          headers: createJsonHeaders(token),
          next: { tags: ["monthlyComparison"] },
          cache: "no-store",
        },
      ),
    ]);

    const currentData = currentResponse.ok ? await currentResponse.json() : [];
    const previousData = previousResponse.ok
      ? await previousResponse.json()
      : [];

    return {
      currentMonth: currentData[0] || buildDefaultComparison(currentStartDate),
      previousMonth:
        previousData[0] || buildDefaultComparison(previousStartDate),
    };
  } catch (error) {
    return {
      currentMonth: buildDefaultComparison(currentStartDate),
      previousMonth: buildDefaultComparison(previousStartDate),
    };
  }
}

export async function getSixMonthComparison(): Promise<
  SixMonthComparisonItem[]
> {
  noStore();

  const backendUrl = getServerBackendUrl();
  const token = await getServerToken();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const months = Array.from({ length: 6 }, (_, index) => {
    let targetMonth = currentMonth - index;
    let targetYear = currentYear;

    while (targetMonth < 0) {
      targetMonth += 12;
      targetYear -= 1;
    }

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      label: new Date(targetYear, targetMonth, 1).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      }),
    };
  });

  if (!token) {
    return months
      .map((month) => ({
        month: month.startDate.slice(0, 7),
        totalExpenses: 0,
        totalIncomes: 0,
        label: month.label,
      }))
      .reverse();
  }

  try {
    const results = await Promise.all(
      months.map(async (month) => {
        const response = await fetch(
          `${backendUrl}/dashboard/monthly-comparison?startDate=${month.startDate}&endDate=${month.endDate}`,
          {
            headers: createJsonHeaders(token),
            next: { tags: ["sixMonthComparison"] },
            cache: "no-store",
          },
        );

        const data = response.ok ? await response.json() : [];

        return {
          ...(data[0] || {
            month: month.startDate.slice(0, 7),
            totalExpenses: 0,
            totalIncomes: 0,
          }),
          label: month.label,
        };
      }),
    );

    return results.reverse();
  } catch (error) {
    return months
      .map((month) => ({
        month: month.startDate.slice(0, 7),
        totalExpenses: 0,
        totalIncomes: 0,
        label: month.label,
      }))
      .reverse();
  }
}
