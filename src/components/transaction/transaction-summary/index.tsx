"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTransactionTotals } from "@/actions/transaction/search-transactions";
import { queryKeys } from "@/hooks/queries/query-keys";
import { MONTH_PATTERN, transactionMonthUrl } from "@/lib/transaction-month";
import { monthLabel, shiftMonth } from "@/components/calendar/calendar-utils";
import { TransactionDialog } from "@/components/dashboard/transaction-dialog";
import type {
  TransactionSearchFilters,
  TransactionTotals,
  Transaction,
} from "@/models/transaction.model";
import { useCreateTransaction } from "@/hooks/queries/useCreateTransaction";
import SummaryCard from "@/components/summary-card";
import { formatCurrency } from "@/utils/formatters";

interface TransactionSummaryProps {
  month: string;
  filters: TransactionSearchFilters;
  initialTotals?: TransactionTotals;
}

export function TransactionSummary({
  month,
  filters,
  initialTotals,
}: TransactionSummaryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { createTransactionAsync, isLoading } = useCreateTransaction();
  const router = useRouter();
  const {
    data: totals,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.transactions.totals(filters),
    queryFn: () => getTransactionTotals(filters),
    initialData: initialTotals,
    retry: false,
  });
  const { totalIncome = 0, totalExpense = 0, balance = 0 } = totals ?? {};
  const navigateMonth = (value: string) => {
    if (MONTH_PATTERN.test(value))
      router.push(transactionMonthUrl(value, filters));
  };
  const summaryCards = [
    {
      title: "Saldo",
      content: formatCurrency(balance),
      className:
        "bg-green-50 dark:bg-green-800/50 border-green-100 dark:border-green-800/50",
      valueClassName:
        balance >= 0
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
    },
    {
      title: "Entradas",
      content: formatCurrency(totalIncome),
      className:
        "bg-blue-50 dark:bg-blue-800/50 border-blue-100 dark:border-blue-800/50",
      valueClassName: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Saídas",
      content: formatCurrency(totalExpense),
      className:
        "bg-red-50 dark:bg-red-800/50 border-red-100 dark:border-red-800/50",
      valueClassName: "text-red-600 dark:text-red-400",
    },
  ];

  const handleTransactionSubmit = async (transaction: Transaction) => {
    await createTransactionAsync(transaction);
    setIsDialogOpen(false);
  };

  return (
    <div className="mb-8 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transações do mês</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Totais de {monthLabel(month)}, considerando todos os resultados dos
            filtros.
          </p>
        </div>
        <TransactionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleTransactionSubmit}
          loading={isLoading}
        />
      </div>

      <nav className="flex items-end gap-2" aria-label="Navegar por mês">
        <Button
          variant="outline"
          size="icon"
          aria-label="Mês anterior"
          disabled={month === "1000-01"}
          onClick={() => navigateMonth(shiftMonth(month, -1))}
        >
          <ChevronLeft />
        </Button>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium">Mês</span>
          <Input
            type="month"
            min="1000-01"
            max="9999-12"
            value={month}
            onChange={(event) => navigateMonth(event.target.value)}
          />
        </label>
        <Button
          variant="outline"
          size="icon"
          aria-label="Próximo mês"
          disabled={month === "9999-12"}
          onClick={() => navigateMonth(shiftMonth(month, 1))}
        >
          <ChevronRight />
        </Button>
      </nav>
      {isError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 p-4 text-sm text-red-700 dark:text-red-300"
        >
          Não foi possível carregar os totais do mês.{" "}
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : isPending ? (
        <p role="status">Carregando totais do mês...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <SummaryCard key={card.title} {...card} />
          ))}
        </div>
      )}
    </div>
  );
}
