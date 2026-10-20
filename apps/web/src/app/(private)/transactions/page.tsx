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
import { exportMode, exportsAvailable } from "@/lib/deployment-features";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TransactionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Normaliza parâmetros da URL e aplica o mesmo período à listagem e aos totais. */
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

/** Carrega a primeira página no servidor; o componente cliente continua a paginação. */
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
  // Lista e totais usam os filtros; o saldo acumulado considera todo o histórico.
  // allSettled permite mostrar os blocos disponíveis e tratar a falha de cada leitura.
  const [pageResult, totalsResult, balanceResult] = await Promise.allSettled([
    searchTransactions(filters),
    getTransactionTotals(filters),
    getTotalBalance(),
  ]);

  // A key da lista muda com os filtros: remontar descarta cursores da busca anterior,
  // que a API não aceita para outra combinação de período, tipo, categoria ou texto.
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
        exportsAvailable={exportsAvailable()}
        exportMode={exportMode()}
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
