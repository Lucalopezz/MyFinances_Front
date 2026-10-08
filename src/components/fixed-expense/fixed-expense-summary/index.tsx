"use client";

import SummaryCard from "@/components/summary-card";
import type { FixedExpense } from "@/models/fixed-expense.model";
import { formatCurrency } from "@/utils/formatters";
import { useFixedExpenses } from "@/hooks/queries/useFixedExpenses";
import { Button } from "@/components/ui/button";

import { FixedExpenseList } from "../fixed-expense-list";

interface FixedExpenseSummaryProps {
  fixedExpenses: FixedExpense[];
}

export function FixedExpenseSummary({
  fixedExpenses,
}: FixedExpenseSummaryProps) {
  // O cache mantém a última lista bem-sucedida quando a atualização falha.
  // isError acrescenta uma orientação pública e refetch permite nova leitura,
  // sem limpar dados nem reenviar marcação de pagamento/criação de despesa.
  const { data: currentFixedExpenses = [], isError, refetch } = useFixedExpenses(fixedExpenses);
  const totalAmount = currentFixedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const summaryCards = [
    {
      title: "Total de despesas fixas",
      content: formatCurrency(totalAmount),
      className:
        "bg-red-50 dark:bg-red-800/50 border-red-100 dark:border-red-800/50",
      valueClassName: "text-red-600 dark:text-red-400",
    },
    {
      title: "Quantidade de despesas",
      content: currentFixedExpenses.length,
      className:
        "bg-blue-50 dark:bg-blue-800/50 border-blue-100 dark:border-blue-800/50",
      valueClassName: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="space-y-6">
      {isError && (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm">
          <p>Não foi possível atualizar as despesas fixas.</p>
          <Button size="sm" variant="outline" onClick={() => void refetch()}>Tentar novamente</Button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      <FixedExpenseList fixedExpenses={currentFixedExpenses} />
    </div>
  );
}
