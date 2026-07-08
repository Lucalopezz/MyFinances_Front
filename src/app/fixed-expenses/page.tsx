import { Suspense } from "react";

import { FixedExpenseSummary } from "@/components/fixed-expense/fixed-expense-summary";
import { FixedExpenseDialogButton } from "@/components/fixed-expense/fixed-expense-dialog-button";
import { getFixedExpenses } from "@/services/fixed-expenses.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FixedExpenses() {
  const fixedExpenses = await getFixedExpenses();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 dark:text-white">
        Minhas despesas fixas
      </h2>
      <Suspense fallback={<div>Carregando despesas fixas...</div>}>
        <FixedExpenseSummary fixedExpenses={fixedExpenses} />
      </Suspense>
      <div className="mt-6">
        <FixedExpenseDialogButton />
      </div>
    </div>
  );
}
