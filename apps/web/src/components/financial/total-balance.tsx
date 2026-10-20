"use client";

import { useQuery } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { getTotalBalance } from "@/actions/transaction/search-transactions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/hooks/queries/query-keys";
import type { TransactionTotals } from "@/models/transaction.model";
import { formatCurrency } from "@/utils/formatters";

export function TotalBalance({
  initialData,
}: {
  initialData?: TransactionTotals;
}) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.transactions.balance(),
    queryFn: getTotalBalance,
    initialData,
    retry: false,
  });

  return (
    <section
      aria-labelledby="total-balance-title"
      className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/40 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <Wallet
          className="mt-1 size-5 shrink-0 text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h2
            id="total-balance-title"
            className="text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            Saldo total
          </h2>
          {isError ? (
            <div
              role="alert"
              className="mt-2 flex flex-wrap items-center gap-2 text-sm text-red-700 dark:text-red-300"
            >
              Não foi possível carregar o saldo total.
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
              >
                Tentar novamente
              </Button>
            </div>
          ) : isPending ? (
            <div role="status" className="mt-2">
              <span className="sr-only">Carregando saldo total...</span>
              <Skeleton className="h-9 w-44" />
            </div>
          ) : data ? (
            <p
              aria-live="polite"
              className={`mt-1 break-words text-3xl font-semibold tracking-tight sm:text-4xl ${data.balance < 0 ? "text-red-600 dark:text-red-400" : "text-blue-800 dark:text-blue-200"}`}
            >
              {formatCurrency(data.balance)}
            </p>
          ) : null}
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Receitas menos despesas de todo o histórico registrado no
            aplicativo. O mês e os filtros não alteram este saldo.
          </p>
        </div>
      </div>
    </section>
  );
}
