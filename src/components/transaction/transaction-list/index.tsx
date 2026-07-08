import type { Transaction } from "@/components/transaction/types";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { deleteTransactionAction } from "@/actions/transaction/delete-transaction-action";
import { TransactionRowActions } from "../transaction-row-actions";
import { CATEGORY_LABELS } from "@/constants/transaction-categories";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  async function handleDelete(id: string) {
    "use server";

    await deleteTransactionAction(id);
  }

  return (
    <>
      {/* Versão Desktop (tabela) */}
      <div className="hidden md:block border rounded-lg shadow-sm border-gray-300 dark:border-gray-700">
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Table>
            <TableBody>
              {transactions.map((transaction) => (
                <DesktopTransactionRow
                  key={
                    transaction.id ||
                    `${transaction.date}-${transaction.description}-${transaction.value}`
                  }
                  transaction={transaction}
                  handleDelete={handleDelete} // Passamos a ação como prop
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Versão Mobile (cards) */}
      <div className="md:hidden space-y-3">
        {transactions.map((transaction) => (
          <MobileTransactionCard
            key={
              transaction.id ||
              `${transaction.date}-${transaction.description}-${transaction.value}`
            }
            transaction={transaction}
            handleDelete={handleDelete} // Passamos a ação como prop
          />
        ))}
      </div>
    </>
  );
}

// Componente para linha da tabela (desktop)
function DesktopTransactionRow({
  transaction,
  handleDelete,
}: {
  transaction: Transaction;
  handleDelete: (id: string) => Promise<void>;
}) {
  const categoryLabel =
    CATEGORY_LABELS[transaction.category as keyof typeof CATEGORY_LABELS] ??
    transaction.category;

  return (
    <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
      <TableCell className="py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
        {new Date(transaction.date).toLocaleDateString()}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
        {transaction.description}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
        {categoryLabel}
      </TableCell>
      <TableCell
        className={`py-4 whitespace-nowrap font-medium ${
          transaction.type === "INCOME"
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {transaction.type === "INCOME" ? "+" : "-"} R${" "}
        {transaction.value.toFixed(2)}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        {transaction.type === "INCOME" ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Entrada
          </Badge>
        ) : (
          <Badge variant="destructive">Saída</Badge>
        )}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <TransactionRowActions
          transaction={transaction}
          deleteAction={handleDelete}
        />
      </TableCell>
    </TableRow>
  );
}

// Componente para card mobile
function MobileTransactionCard({
  transaction,
  handleDelete,
}: {
  transaction: Transaction;
  handleDelete: (id: string) => Promise<void>;
}) {
  const categoryLabel =
    CATEGORY_LABELS[transaction.category as keyof typeof CATEGORY_LABELS] ??
    transaction.category;

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {transaction.description}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date(transaction.date).toLocaleDateString()}
          </div>
        </div>
        <div
          className={`text-lg font-semibold ${
            transaction.type === "INCOME"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {transaction.type === "INCOME" ? "+" : "-"} R${" "}
          {transaction.value.toFixed(2)}
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Badge
            variant={transaction.type === "INCOME" ? "default" : "destructive"}
          >
            {categoryLabel}
          </Badge>
          {transaction.type === "INCOME" ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Entrada
            </Badge>
          ) : (
            <Badge variant="destructive">Saída</Badge>
          )}
        </div>

        <TransactionRowActions
          transaction={transaction}
          deleteAction={handleDelete}
        />
      </div>
    </div>
  );
}
