"use client";

import SummaryCard from "@/components/summary-card";
import type { FixedExpense } from "@/models/fixed-expense.model";
import { formatCurrency } from "@/utils/formatters";
import { useFixedExpenses } from "@/hooks/queries/useFixedExpenses";

import { FixedExpenseList } from "../fixed-expense-list";

interface FixedExpenseSummaryProps {
  fixedExpenses: FixedExpense[];
}

export function FixedExpenseSummary({
  fixedExpenses,
}: FixedExpenseSummaryProps) {
  const { data: currentFixedExpenses = [] } = useFixedExpenses(fixedExpenses);
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      <FixedExpenseList
        fixedExpenses={currentFixedExpenses}
        editUrlPrefix="/fixed-expenses/edit"
      />
    </div>
  );
}
