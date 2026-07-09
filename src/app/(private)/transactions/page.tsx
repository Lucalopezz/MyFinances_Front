import { TransactionSummary } from "@/components/transaction/transaction-summary";
import { getTransactions } from "@/actions/transaction/transactions";
import { TransactionList } from "@/components/transaction/transaction-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="flex-1">
      <h2 className="text-xl font-semibold mb-6 dark:text-white">
        Listagem de Transações
      </h2>
      <TransactionSummary transactions={transactions} />
      <TransactionList transactions={transactions} />
    </div>
  );
}
