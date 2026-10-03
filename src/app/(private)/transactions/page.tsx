import { TransactionSummary } from "@/components/transaction/transaction-summary";
import { TransactionSearchList } from "@/components/transaction/transaction-search-list";
import {
  getTransactionTotals,
  getTotalBalance,
  searchTransactions,
} from "@/actions/transaction/search-transactions";
import { categoryReferenceSchema } from "@/schemas/category.schema";
import type { TransactionSearchFilters } from "@/models/transaction.model";
import { currentDay } from "@/components/calendar/calendar-utils";
import { MONTH_PATTERN, transactionMonthRange } from "@/lib/transaction-month";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TransactionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(
  params: Record<string, string | string[] | undefined>,
  month: string,
): TransactionSearchFilters {
  const type = first(params.type);
  const category = first(params.category);
  const search = first(params.search)?.trim().slice(0, 100);

  return {
    ...transactionMonthRange(month),
    type: type === "INCOME" || type === "EXPENSE" ? type : undefined,
    category: categoryReferenceSchema.safeParse(category).success
      ? category
      : undefined,
    search: search || undefined,
  };
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const requestedMonth = first(params.month);
  const month =
    requestedMonth && MONTH_PATTERN.test(requestedMonth)
      ? requestedMonth
      : currentDay().slice(0, 7);
  const filters = parseFilters(params, month);
  const [pageResult, totalsResult, balanceResult] = await Promise.allSettled([
    searchTransactions(filters),
    getTransactionTotals(filters),
    getTotalBalance(),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <TransactionSummary
        month={month}
        filters={filters}
        initialBalance={
          balanceResult.status === "fulfilled" ? balanceResult.value : undefined
        }
        initialTotals={
          totalsResult.status === "fulfilled" ? totalsResult.value : undefined
        }
      />
      <TransactionSearchList
        key={JSON.stringify(filters)}
        month={month}
        filters={filters}
        initialPage={
          pageResult.status === "fulfilled" ? pageResult.value : null
        }
        initialError={
          pageResult.status === "rejected"
            ? "Não foi possível buscar as transações. Tente novamente."
            : undefined
        }
      />
    </div>
  );
}
