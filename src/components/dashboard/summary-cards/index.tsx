"use client";

import { PeriodTotals } from "@/components/financial/period-totals";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCurrency,
  formatMonthLabel,
  formatPercentage,
} from "@/utils/formatters";
import { useCategories } from "@/providers/category-provider";

interface SummaryCardsProps {
  balance: number;
  totalIncomes: number;
  totalExpenses: number;
  economyRate?: number;
  highestSpendingCategory?: {
    category: string;
    total: number;
  } | null;
  periodStart: string;
  isLoading: boolean;
}

const SummaryCards = ({
  balance,
  totalIncomes,
  totalExpenses,
  economyRate,
  highestSpendingCategory,
  periodStart,
  isLoading,
}: SummaryCardsProps) => {
  const { categoryLabel } = useCategories();
  const monthLabel = formatMonthLabel(periodStart);
  const highestSpendingCategoryLabel = highestSpendingCategory?.category
    ? categoryLabel(highestSpendingCategory.category)
    : "Sem despesas no mês";
  return (
    <div className="mb-6 space-y-3">
      {isLoading ? (
        <Skeleton className="h-36 w-full rounded-xl" />
      ) : (
        <PeriodTotals
          balance={balance}
          income={totalIncomes}
          expense={totalExpenses}
        />
      )}
      <details className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
        <summary className="cursor-pointer font-medium text-slate-600 dark:text-slate-300">
          Mais indicadores de {monthLabel}
        </summary>
        {isLoading ? (
          <Skeleton className="mt-3 h-16 w-full" />
        ) : (
          <dl className="mt-4 grid gap-4 pb-1 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Economia do mês
              </dt>
              <dd
                className={`mt-1 font-semibold ${(economyRate ?? 0) < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}
              >
                {formatPercentage(economyRate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Maior gasto por categoria
              </dt>
              <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                {highestSpendingCategoryLabel}
                {highestSpendingCategory
                  ? ` · ${formatCurrency(highestSpendingCategory.total)}`
                  : ""}
              </dd>
            </div>
          </dl>
        )}
      </details>
    </div>
  );
};

export default SummaryCards;
