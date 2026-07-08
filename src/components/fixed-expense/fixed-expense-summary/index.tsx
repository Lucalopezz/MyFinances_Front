import SummaryCard from "@/components/summary-card";
import { formatCurrency } from "@/utils/formatters";

import { FixedExpenseList } from "../fixed-expense-list";

export interface FixedExpense {
  id?: string;
  name: string;
  amount: number;
  dueDate: string;
  recurrence: string;
}

interface FixedExpenseSummaryProps {
  fixedExpenses: FixedExpense[];
}

export function FixedExpenseSummary({
  fixedExpenses,
}: FixedExpenseSummaryProps) {
  const totalAmount = fixedExpenses.reduce(
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
      content: fixedExpenses.length,
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
        fixedExpenses={fixedExpenses}
        editUrlPrefix="/fixed-expenses/edit"
      />
    </div>
  );
}
