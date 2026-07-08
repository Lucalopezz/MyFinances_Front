import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import { unstable_noStore as noStore } from "next/cache";

export interface FinancialSummary {
  balance: number;
  totalIncomes: number;
  totalExpenses: number;
  economyRate?: number;
  highestSpendingCategory?: {
    category: string;
    total: number;
  } | null;
  period: {
    start: string;
    end: string;
  };
}

export interface MonthlyComparisonDto {
  month: string;
  totalExpenses: number;
  totalIncomes: number;
  balance?: number;
  economyRate?: number;
  percentageChange?: number;
}

export interface MonthlyComparisonResponse {
  months: MonthlyComparisonDto[];
  bestMonth?: {
    month: string;
    balance: number;
    economyRate?: number;
  } | null;
  worstMonth?: {
    month: string;
    balance: number;
    economyRate?: number;
  } | null;
  period: {
    start: string;
    end: string;
  };
}

export interface SixMonthComparisonItem extends MonthlyComparisonDto {
  label: string;
}

const MONTH_PARAM_PATTERN = /^\d{4}-\d{2}$/;

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getSelectedMonthDate(month?: string) {
  if (month && MONTH_PARAM_PATTERN.test(month)) {
    const [year, monthNumber] = month.split("-").map(Number);

    if (monthNumber >= 1 && monthNumber <= 12) {
      return new Date(year, monthNumber - 1, 1);
    }
  }

  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getMonthPeriod(month?: string) {
  const selectedMonth = getSelectedMonthDate(month);
  const start = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    1,
  );
  const end = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0,
  );

  return {
    selectedMonth: formatDateParam(start).slice(0, 7),
    startDate: formatDateParam(start),
    endDate: formatDateParam(end),
  };
}

function getComparisonPeriod(month?: string) {
  const selectedMonth = getSelectedMonthDate(month);
  const start = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() - 5,
    1,
  );
  const end = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0,
  );

  return {
    startDate: formatDateParam(start),
    endDate: formatDateParam(end),
  };
}

function getEmptySummary(month?: string): FinancialSummary {
  const { startDate, endDate } = getMonthPeriod(month);

  return {
    balance: 0,
    totalIncomes: 0,
    totalExpenses: 0,
    economyRate: 0,
    highestSpendingCategory: null,
    period: {
      start: startDate,
      end: endDate,
    },
  };
}

function buildDefaultComparison(month: string): MonthlyComparisonDto {
  return {
    month,
    totalExpenses: 0,
    totalIncomes: 0,
    balance: 0,
    economyRate: 0,
  };
}

export async function getDashboardSummary(
  month?: string,
): Promise<FinancialSummary> {
  noStore();

  const backendUrl = getServerBackendUrl();
  const { startDate, endDate } = getMonthPeriod(month);
  const token = await getServerToken();
  const emptySummary = getEmptySummary(month);

  if (!token) {
    return emptySummary;
  }

  try {
    const response = await fetch(
      `${backendUrl}/dashboard?startDate=${startDate}&endDate=${endDate}`,
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

export async function getMonthlyComparison(
  month?: string,
): Promise<MonthlyComparisonResponse> {
  noStore();

  const backendUrl = getServerBackendUrl();
  const token = await getServerToken();
  const selectedMonth = getMonthPeriod(month).selectedMonth;
  const { startDate, endDate } = getComparisonPeriod(month);
  const emptyComparison: MonthlyComparisonResponse = {
    months: [buildDefaultComparison(selectedMonth)],
    bestMonth: null,
    worstMonth: null,
    period: {
      start: startDate,
      end: endDate,
    },
  };

  if (!token) {
    return emptyComparison;
  }

  try {
    const response = await fetch(
      `${backendUrl}/dashboard/monthly-comparison?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: createJsonHeaders(token),
        next: { tags: ["monthlyComparison"] },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return emptyComparison;
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return {
        ...emptyComparison,
        months: data.length ? data : emptyComparison.months,
      };
    }

    return {
      ...emptyComparison,
      ...data,
      months: Array.isArray(data.months) && data.months.length
        ? data.months
        : emptyComparison.months,
    };
  } catch (error) {
    return emptyComparison;
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
        const monthData = Array.isArray(data) ? data[0] : data.months?.[0];

        return {
          ...(monthData || {
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
