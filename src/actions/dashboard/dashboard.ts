import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import type {
  FinancialSummary,
  MonthlyComparisonDto,
  MonthlyComparisonResponse,
  CategorySpending,
  ComparativeBlock,
  SemesterComparisonData,
  SemesterPeriod,
  SemesterSummary,
  SixMonthComparisonItem,
} from "@/models/dashboard.model";
import type { PaginatedTransactions } from "@/models/transaction.model";
import { unstable_noStore as noStore } from "next/cache";

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

function getSemesterPeriods(): {
  current: SemesterPeriod;
  previous: SemesterPeriod;
} {
  const now = new Date();
  const currentStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const previousStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const previousEnd = new Date(now.getFullYear(), now.getMonth() - 5, 0);

  return {
    current: {
      start: formatDateParam(currentStart),
      end: formatDateParam(currentEnd),
    },
    previous: {
      start: formatDateParam(previousStart),
      end: formatDateParam(previousEnd),
    },
  };
}

function success<T>(data: T): ComparativeBlock<T> {
  return { data, error: null };
}

function failure<T>(message: string): ComparativeBlock<T> {
  return { data: null, error: message };
}

function toNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function fetchSemesterSummary(
  backendUrl: string,
  token: string,
  period: SemesterPeriod,
): Promise<ComparativeBlock<SemesterSummary>> {
  try {
    const searchParams = new URLSearchParams({
      startDate: period.start,
      endDate: period.end,
    });
    const response = await fetch(`${backendUrl}/dashboard?${searchParams}`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["dashboard", "sixMonthComparison"] },
    });

    if (!response.ok) {
      return failure("Não foi possível carregar os indicadores do semestre.");
    }

    const data: FinancialSummary = await response.json();
    const totalIncomes = toNumber(data.totalIncomes);
    const totalExpenses = toNumber(data.totalExpenses);
    const balance = toNumber(data.balance);
    const apiEconomyRate =
      typeof data.economyRate === "number" && Number.isFinite(data.economyRate)
        ? data.economyRate
        : null;

    return success({
      totalIncomes,
      totalExpenses,
      balance,
      economyRate:
        apiEconomyRate ??
        (totalIncomes > 0 ? (balance / totalIncomes) * 100 : 0),
      highestSpendingCategory: data.highestSpendingCategory ?? null,
      period,
    });
  } catch {
    return failure("Não foi possível carregar os indicadores do semestre.");
  }
}

async function fetchMonthlyComparisonForPeriod(
  backendUrl: string,
  token: string,
  period: SemesterPeriod,
): Promise<ComparativeBlock<MonthlyComparisonResponse>> {
  try {
    const searchParams = new URLSearchParams({
      startDate: period.start,
      endDate: period.end,
    });
    const response = await fetch(
      `${backendUrl}/dashboard/monthly-comparison?${searchParams}`,
      {
        headers: createJsonHeaders(token),
        cache: "no-store",
        next: { tags: ["monthlyComparison", "sixMonthComparison"] },
      },
    );

    if (!response.ok) {
      return failure("Não foi possível carregar a evolução mensal.");
    }

    const payload = await response.json();
    const months = Array.isArray(payload) ? payload : payload.months;

    if (!Array.isArray(months)) {
      return failure("A API retornou um comparativo mensal inválido.");
    }

    return success({
      months,
      bestMonth: Array.isArray(payload) ? null : (payload.bestMonth ?? null),
      worstMonth: Array.isArray(payload) ? null : (payload.worstMonth ?? null),
      period,
    });
  } catch {
    return failure("Não foi possível carregar a evolução mensal.");
  }
}

async function fetchTransactionsPage(
  backendUrl: string,
  token: string,
  page: number,
): Promise<PaginatedTransactions> {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: "50",
  });
  const response = await fetch(`${backendUrl}/transactions?${searchParams}`, {
    headers: createJsonHeaders(token),
    cache: "no-store",
    next: { tags: ["transactions", "sixMonthComparison"] },
  });

  if (!response.ok) {
    throw new Error("transactions-request-failed");
  }

  return response.json();
}

async function fetchCategorySpending(
  backendUrl: string,
  token: string,
  period: SemesterPeriod,
): Promise<ComparativeBlock<CategorySpending[]>> {
  try {
    const firstPage = await fetchTransactionsPage(backendUrl, token, 1);
    const totalPages = Math.max(1, toNumber(firstPage.meta?.totalPages));
    // Fetch remaining pages in parallel
    // It can be optimized by using a single endpoint that returns all transactions for the period, but for now we will fetch all pages in parallel.
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        fetchTransactionsPage(backendUrl, token, index + 2),
      ),
    );
    const transactions = [firstPage, ...remainingPages].flatMap(
      (page) => page.data,
    );
    const totals = new Map<string, number>();

    for (const transaction of transactions) {
      const transactionDate = transaction.date.slice(0, 10);

      if (
        transaction.type !== "EXPENSE" ||
        transactionDate < period.start ||
        transactionDate > period.end
      ) {
        continue;
      }

      totals.set(
        transaction.category,
        (totals.get(transaction.category) ?? 0) + toNumber(transaction.value),
      );
    }

    const totalExpenses = Array.from(totals.values()).reduce(
      (total, value) => total + value,
      0,
    );
    const categories = Array.from(totals, ([category, total]) => ({
      category,
      total,
      percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
    })).sort((a, b) => b.total - a.total);

    return success(categories);
  } catch {
    return failure("Não foi possível carregar os gastos por categoria.");
  }
}

export async function getSemesterComparison(): Promise<SemesterComparisonData> {
  noStore();

  const periods = getSemesterPeriods();
  const token = await getServerToken();

  if (!token) {
    const sessionError = "Sua sessão expirou. Entre novamente.";
    return {
      currentSummary: failure(sessionError),
      previousSummary: failure(sessionError),
      monthlyComparison: failure(sessionError),
      categorySpending: failure(sessionError),
      balancePercentageChange: null,
      currentPeriod: periods.current,
      previousPeriod: periods.previous,
    };
  }

  const backendUrl = getServerBackendUrl();
  const [currentSummary, previousSummary, monthlyComparison, categorySpending] =
    await Promise.all([
      fetchSemesterSummary(backendUrl, token, periods.current),
      fetchSemesterSummary(backendUrl, token, periods.previous),
      fetchMonthlyComparisonForPeriod(backendUrl, token, periods.current),
      fetchCategorySpending(backendUrl, token, periods.current),
    ]);
  const currentBalance = currentSummary.data?.balance;
  const previousBalance = previousSummary.data?.balance;
  const balancePercentageChange =
    currentBalance === undefined || previousBalance === undefined
      ? null
      : previousBalance === 0
        ? currentBalance === 0
          ? 0
          : null
        : ((currentBalance - previousBalance) / Math.abs(previousBalance)) *
          100;

  return {
    currentSummary,
    previousSummary,
    monthlyComparison,
    categorySpending,
    balancePercentageChange,
    currentPeriod: periods.current,
    previousPeriod: periods.previous,
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
      months:
        Array.isArray(data.months) && data.months.length
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
      startDate: formatDateParam(startDate),
      endDate: formatDateParam(endDate),
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
