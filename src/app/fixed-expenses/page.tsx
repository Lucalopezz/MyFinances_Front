import { Suspense } from "react";

import { FixedExpenseSummary } from "@/components/fixed-expense/FixedExpenseSummary";
import { FixedExpenseDialogButton } from "@/components/fixed-expense/FixedExpenseDialogButton";
import { getFixedExpenses } from "./_services";


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