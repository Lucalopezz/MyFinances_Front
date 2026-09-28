"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";

import { searchTransactions } from "@/actions/transaction/search-transactions";
import { ResponsiveList } from "@/components/common/responsive-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/providers/category-provider";
import { queryKeys } from "@/hooks/queries/query-keys";
import { useDeleteTransaction } from "@/hooks/queries/useTransactions";
import type {
  TransactionSearchFilters,
  TransactionSearchPage,
} from "@/models/transaction.model";
import {
  DesktopTransactionRow,
  MobileTransactionCard,
  getTransactionKey,
} from "@/components/transaction/transaction-list";
import { TransactionExport } from "@/components/transaction/transaction-export";

type SearchListProps = {
  filters: TransactionSearchFilters;
  initialPage: TransactionSearchPage | null;
  initialError?: string;
};

function buildUrl(filters: TransactionSearchFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

export function TransactionSearchList({
  filters,
  initialPage,
  initialError,
}: SearchListProps) {
  const { categories } = useCategories();
  const router = useRouter();
  const [draft, setDraft] = useState(filters);
  const [cursor, setCursor] = useState<string | undefined>();
  const [history, setHistory] = useState<string[]>([]);
  useEffect(() => setDraft(filters), [filters]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.transactions.search(filters, cursor),
    queryFn: async () => {
      const page = await searchTransactions(filters, cursor);
      if (!page)
        throw new Error("A busca de transações ainda não está disponível.");
      return page;
    },
    initialData: !cursor ? (initialPage ?? undefined) : undefined,
    retry: false,
  });
  const { deleteTransaction } = useDeleteTransaction();

  function updateFilter(key: keyof TransactionSearchFilters, value: string) {
    setDraft((current) => ({ ...current, [key]: value || undefined }));
  }

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(buildUrl(draft));
  }

  const hasFilters = Object.values(filters).some(Boolean);
  const message = isError
    ? error instanceof Error
      ? error.message
      : "Não foi possível buscar as transações."
    : !data
      ? initialError
      : null;

  return (
    <section className="space-y-4" aria-labelledby="transactions-list-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="transactions-list-title" className="text-xl font-semibold">
            Transações
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Busque em todo o histórico. Os filtros ficam no endereço para você
            compartilhar a consulta.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A exportação inclui todas as transações e é independente desta
            busca.
          </p>
        </div>
        <TransactionExport />
      </div>

      <form
        onSubmit={submitFilters}
        className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 md:grid-cols-2 xl:grid-cols-5"
      >
        <label className="md:col-span-2 xl:col-span-1">
          <span className="mb-1 block text-xs font-medium">Buscar</span>
          <span className="relative block">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <Input
              value={draft.search ?? ""}
              maxLength={100}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Descrição ou categoria"
              className="pl-9"
            />
          </span>
        </label>
        <div>
          <span className="mb-1 block text-xs font-medium">Tipo</span>
          <Select
            value={draft.type ?? "ALL"}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                type:
                  value === "ALL" ? undefined : (value as "INCOME" | "EXPENSE"),
                category: undefined,
              }))
            }
          >
            <SelectTrigger aria-label="Filtrar por tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os tipos</SelectItem>
              <SelectItem value="INCOME">Entradas</SelectItem>
              <SelectItem value="EXPENSE">Saídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium">Categoria</span>
          <Select
            value={draft.category ?? "ALL"}
            onValueChange={(value) =>
              updateFilter("category", value === "ALL" ? "" : value)
            }
          >
            <SelectTrigger aria-label="Filtrar por categoria">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as categorias</SelectItem>
              {categories
                .filter(
                  (category) => !draft.type || category.type === draft.type,
                )
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                    {category.archived ? " (arquivada)" : ""}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <label>
          <span className="mb-1 block text-xs font-medium">Data inicial</span>
          <Input
            type="date"
            value={draft.startDate ?? ""}
            max={draft.endDate}
            onChange={(event) => updateFilter("startDate", event.target.value)}
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium">Data final</span>
          <Input
            type="date"
            value={draft.endDate ?? ""}
            min={draft.startDate}
            onChange={(event) => updateFilter("endDate", event.target.value)}
          />
        </label>
        <div className="flex gap-2 md:col-span-2 xl:col-span-5">
          <Button type="submit">Aplicar filtros</Button>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDraft({});
                router.push("/transactions");
              }}
            >
              <X aria-hidden="true" /> Limpar filtros
            </Button>
          )}
        </div>
      </form>

      {message ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 p-4 text-sm text-red-700 dark:border-red-900 dark:text-red-300"
        >
          {message}{" "}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      ) : null}
      {isPending ? (
        <p className="text-sm text-gray-500">Buscando transações...</p>
      ) : null}
      {data ? (
        <>
          <p
            className="text-sm text-gray-500 dark:text-gray-400"
            aria-live="polite"
          >
            {data.data.length} transações nesta página
            {data.hasMore ? " · há mais resultados" : " · fim dos resultados"}
          </p>
          <ResponsiveList
            items={data.data}
            getKey={getTransactionKey}
            emptyState={
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
                Nenhuma transação encontrada.
              </div>
            }
            renderDesktopRow={(transaction) => (
              <DesktopTransactionRow
                transaction={transaction}
                handleDelete={deleteTransaction}
              />
            )}
            renderMobileCard={(transaction) => (
              <MobileTransactionCard
                transaction={transaction}
                handleDelete={deleteTransaction}
              />
            )}
          />
          {(history.length > 0 || data.hasMore) && (
            <nav
              className="flex items-center justify-between border-t pt-4"
              aria-label="Paginação de transações"
            >
              <Button
                type="button"
                variant="outline"
                disabled={history.length === 0}
                onClick={() => {
                  setCursor(history.at(-1) || undefined);
                  setHistory(history.slice(0, -1));
                }}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!data.hasMore || !data.nextCursor}
                onClick={() => {
                  setHistory([...history, cursor ?? ""]);
                  setCursor(data.nextCursor ?? undefined);
                }}
              >
                Próxima
              </Button>
            </nav>
          )}
        </>
      ) : null}
    </section>
  );
}
