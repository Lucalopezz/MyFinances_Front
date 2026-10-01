import { TransactionSummary } from "@/components/transaction/transaction-summary";
import { getTransactions } from "@/actions/transaction/transactions";
import { TransactionList } from "@/components/transaction/transaction-list";
import { TransactionSearchList } from "@/components/transaction/transaction-search-list";
import { searchTransactions } from "@/actions/transaction/search-transactions";
import { categoryReferenceSchema } from "@/schemas/category.schema";
import type {
  TransactionSearchFilters,
  TransactionSearchPage,
} from "@/models/transaction.model";

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
): TransactionSearchFilters {
  const type = first(params.type);
  const category = first(params.category);
  const search = first(params.search)?.trim().slice(0, 100);
  const startDate = first(params.startDate);
  const endDate = first(params.endDate);

  return {
    type: type === "INCOME" || type === "EXPENSE" ? type : undefined,
    category: categoryReferenceSchema.safeParse(category).success
      ? category
      : undefined,
    search: search || undefined,
    startDate:
      startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)
        ? startDate
        : undefined,
    endDate:
      endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate) ? endDate : undefined,
  };
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const pageParam = first(params.page);
  const requestedPage = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const parsedPage = Number(requestedPage);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const filters = parseFilters(params);
  let searchPage: TransactionSearchPage | null = null;
  let searchError: string | undefined;
  try {
    searchPage = await searchTransactions(filters);
  } catch (error) {
    searchError =
      error instanceof Error
        ? error.message
        : "Não foi possível buscar as transações.";
  }
  const isSearchAvailable = searchPage !== null || Boolean(searchError);
  const transactions = await getTransactions(isSearchAvailable ? 1 : page);

  return (
    <div className="flex-1 p-4 sm:p-6">
      <TransactionSummary
        transactions={transactions}
        page={isSearchAvailable ? 1 : page}
      />
      {isSearchAvailable ? (
        <TransactionSearchList
          key={JSON.stringify(filters)}
          filters={filters}
          initialPage={searchPage}
          initialError={searchError}
        />
      ) : (
        <TransactionList transactions={transactions} page={page} />
      )}
    </div>
  );
}
