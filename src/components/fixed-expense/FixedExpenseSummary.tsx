import { FixedExpenseList } from "./FixedExpenseList";

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

export function FixedExpenseSummary({ fixedExpenses }: FixedExpenseSummaryProps) {
  const totalAmount = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card de Total de Despesas Fixas */}
        <div className="bg-red-50 dark:bg-red-800/50 p-4 rounded-lg border border-red-100 dark:border-red-800/50">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total de despesas fixas
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
            R$ {totalAmount.toFixed(2)}
          </div>
        </div>

        {/* Card de Quantidade de Despesas */}
        <div className="bg-blue-50 dark:bg-blue-800/50 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Quantidade de despesas
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {fixedExpenses.length}
          </div>
        </div>
      </div>

      <FixedExpenseList fixedExpenses={fixedExpenses} editUrlPrefix="/fixed-expenses/edit" />
    </div>
  );
}
