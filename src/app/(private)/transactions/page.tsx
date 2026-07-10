import { TransactionSummary } from "@/components/transaction/transaction-summary";
import { getTransactions } from "@/actions/transaction/transactions";
import { TransactionList } from "@/components/transaction/transaction-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TransactionsPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const parsedPage = Number(requestedPage);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const transactions = await getTransactions(page);

  return (
    <div className="flex-1 p-4 sm:p-6">
      <TransactionSummary transactions={transactions} page={page} />
      <TransactionList transactions={transactions} page={page} />
    </div>
  );
}
