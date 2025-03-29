import { Transaction } from "../dashboard/TransactionDialog";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TransactionListProps {
  transactions: Transaction[];
  editUrlPrefix?: string;
  deleteUrlPrefix?: string;
}

export function TransactionList({
  transactions,
  editUrlPrefix = "/transactions/edit",
  deleteUrlPrefix = "/transactions/delete",
}: TransactionListProps) {
  return (
    <>
      {/* Versão Desktop (tabela) - mostrada em md para cima */}
      <div className="hidden md:block border rounded-lg shadow-sm border-gray-300 dark:border-gray-700">
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Table>
            {/* Cabeçalho da tabela (mesmo que antes) */}
            <TableBody>
              {transactions.map((transaction) => (
                <DesktopTransactionRow
                  key={
                    transaction.id ||
                    `${transaction.date}-${transaction.description}-${transaction.value}`
                  }
                  transaction={transaction}
                  editUrlPrefix={editUrlPrefix}
                  deleteUrlPrefix={deleteUrlPrefix}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Versão Mobile (cards) - mostrada em md para baixo */}
      <div className="md:hidden space-y-3">
        {transactions.map((transaction) => (
          <MobileTransactionCard
            key={
              transaction.id ||
              `${transaction.date}-${transaction.description}-${transaction.value}`
            }
            transaction={transaction}
            editUrlPrefix={editUrlPrefix}
            deleteUrlPrefix={deleteUrlPrefix}
          />
        ))}
      </div>
    </>
  );
}

// Componente para linha da tabela (desktop)
function DesktopTransactionRow({
  transaction,
  editUrlPrefix,
  deleteUrlPrefix,
}: {
  transaction: Transaction;
  editUrlPrefix: string;
  deleteUrlPrefix: string;
}) {
  const transactionId =
    transaction.id ||
    encodeURIComponent(
      `${transaction.date}-${transaction.description}-${transaction.value}`
    );
  const editUrl = `${editUrlPrefix}/${transactionId}`;
  const deleteUrl = `${deleteUrlPrefix}/${transactionId}`;

  return (
    <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
      <TableCell className="py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
        {new Date(transaction.date).toLocaleDateString()}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
        {transaction.description}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
        {transaction.category}
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
        <div className="flex space-x-2">
          <a href={editUrl}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          </a>
          <form action={deleteUrl} method="POST">
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Componente para card mobile
function MobileTransactionCard({
  transaction,
  editUrlPrefix,
  deleteUrlPrefix,
}: {
  transaction: Transaction;
  editUrlPrefix: string;
  deleteUrlPrefix: string;
}) {
  const transactionId =
    transaction.id ||
    encodeURIComponent(
      `${transaction.date}-${transaction.description}-${transaction.value}`
    );
  const editUrl = `${editUrlPrefix}/${transactionId}`;
  const deleteUrl = `${deleteUrlPrefix}/${transactionId}`;

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
            {transaction.category}
          </Badge>
          {transaction.type === "INCOME" ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Entrada
            </Badge>
          ) : (
            <Badge variant="destructive">Saída</Badge>
          )}
        </div>

        <div className="flex space-x-2">
          <a href={editUrl}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          </a>
          <form action={deleteUrl} method="POST">
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
