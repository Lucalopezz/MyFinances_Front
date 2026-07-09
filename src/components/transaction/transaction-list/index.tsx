"use client";

import type { Transaction } from "@/models/transaction.model";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { TransactionRowActions } from "../transaction-row-actions";
import { CATEGORY_LABELS } from "@/constants/transaction-categories";
import {
  useDeleteTransaction,
  useTransactions,
} from "@/hooks/queries/useTransactions";
import { MobileListCard } from "@/components/common/mobile-list-card";
import { ResponsiveList } from "@/components/common/responsive-list";
import { StatusBadge } from "@/components/common/status-badge";
import { formatShortDate, formatSignedCurrency } from "@/utils/formatters";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { data: currentTransactions = [] } = useTransactions(transactions);
  const { deleteTransaction } = useDeleteTransaction();

  return (
    <ResponsiveList
      items={currentTransactions}
      getKey={getTransactionKey}
      renderDesktopRow={(transaction) => (
        <DesktopTransactionRow
          transaction={transaction}
          handleDelete={deleteTransaction}
        />
      )}
      renderMobileCard={(transaction) => (
        <MobileTransactionCard
          transaction={transaction}
          handleDelete={deleteTransaction}
        />
      )}
    />
  );
}

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
        {formatShortDate(transaction.date)}
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
        {formatTransactionValue(transaction)}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <TransactionTypeBadge transaction={transaction} />
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
    <MobileListCard
      title={transaction.description}
      meta={formatShortDate(transaction.date)}
      amount={formatTransactionValue(transaction)}
      amountClassName={
        transaction.type === "INCOME"
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      }
      footerLeft={
        <div className="flex items-center space-x-2">
          <Badge
            variant={transaction.type === "INCOME" ? "default" : "destructive"}
          >
            {categoryLabel}
          </Badge>
          {transaction.type === "INCOME" ? (
            <StatusBadge tone="green">Entrada</StatusBadge>
          ) : (
            <Badge variant="destructive">Saída</Badge>
          )}
        </div>
      }
      actions={
        <TransactionRowActions
          transaction={transaction}
          deleteAction={handleDelete}
        />
      }
    />
  );
}

function TransactionTypeBadge({ transaction }: { transaction: Transaction }) {
  return transaction.type === "INCOME" ? (
    <StatusBadge tone="green">Entrada</StatusBadge>
  ) : (
    <Badge variant="destructive">Saída</Badge>
  );
}

function formatTransactionValue(transaction: Transaction) {
  return formatSignedCurrency(
    transaction.value,
    transaction.type === "INCOME" ? "+" : "-",
  );
}

function getTransactionKey(transaction: Transaction) {
  return (
    transaction.id ||
    `${transaction.date}-${transaction.description}-${transaction.value}`
  );
}
