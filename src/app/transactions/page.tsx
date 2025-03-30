import { TransactionSummary } from "@/components/transaction/TransactionSummary";
import { getTransactions } from "./_services";
import { TransactionList } from "@/components/transaction/TransactionList";
import { Suspense } from "react";

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="flex-1">
      <h2 className="text-xl font-semibold mb-6 dark:text-white">
        Listagem de Transações
      </h2>
      <Suspense fallback={<div>Carregando transações...</div>}>
        <TransactionSummary transactions={transactions} />
        <TransactionList transactions={transactions} />
      </Suspense>
    </div>
  );
}
