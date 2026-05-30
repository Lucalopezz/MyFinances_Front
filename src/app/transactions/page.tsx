import { TransactionSummary } from "@/components/transaction/TransactionSummary";
import { getTransactions } from "@/services/transactions.service";
import { TransactionList } from "@/components/transaction/TransactionList";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
