"use client";

import { FixedExpense } from "@/models/fixed-expense.model";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  useDeleteFixedExpense,
  useMarkFixedExpenseAsPaid,
} from "@/hooks/queries/useFixedExpenses";
import { MobileListCard } from "@/components/common/mobile-list-card";
import { ResponsiveList } from "@/components/common/responsive-list";
import { RowActions } from "@/components/common/row-actions";
import { StatusBadge } from "@/components/common/status-badge";
import { formatCurrency, formatShortDate } from "@/utils/formatters";

interface FixedExpenseListProps {
  fixedExpenses: FixedExpense[];
  editUrlPrefix?: string;
}

export function FixedExpenseList({
  fixedExpenses,
  editUrlPrefix = "/fixed-expenses/edit",
}: FixedExpenseListProps) {
  const { deleteFixedExpense } = useDeleteFixedExpense();
  const { markAsPaid } = useMarkFixedExpenseAsPaid();

  return (
    <ResponsiveList
      items={fixedExpenses}
      getKey={getFixedExpenseKey}
      renderDesktopRow={(expense) => (
        <DesktopFixedExpenseRow
          expense={expense}
          editUrlPrefix={editUrlPrefix}
          deleteAction={deleteFixedExpense}
          markAsPaidAction={markAsPaid}
        />
      )}
      renderMobileCard={(expense) => (
        <MobileFixedExpenseCard
          expense={expense}
          editUrlPrefix={editUrlPrefix}
          deleteAction={deleteFixedExpense}
          markAsPaidAction={markAsPaid}
        />
      )}
    />
  );
}

function DesktopFixedExpenseRow({
  expense,
  editUrlPrefix,
  deleteAction,
  markAsPaidAction,
}: {
  expense: FixedExpense;
  editUrlPrefix: string;
  deleteAction: (id: string) => Promise<void>;
  markAsPaidAction: (payload: {
    id: string;
    dueDate: string;
  }) => Promise<boolean>;
}) {
  const expenseId = getFixedExpenseEditId(expense);

  return (
    <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
      <TableCell className="py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
        {expense.name}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-red-600 dark:text-red-400 font-medium">
        {formatCurrency(expense.amount)}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
        {formatShortDate(expense.dueDate)}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <StatusBadge tone="blue">{expense.recurrence}</StatusBadge>
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <FixedExpensePaymentBadge expense={expense} />
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <FixedExpenseActions
          expense={expense}
          editHref={`${editUrlPrefix}/${expenseId}`}
          deleteAction={deleteAction}
          markAsPaidAction={markAsPaidAction}
        />
      </TableCell>
    </TableRow>
  );
}

function MobileFixedExpenseCard({
  expense,
  editUrlPrefix,
  deleteAction,
  markAsPaidAction,
}: {
  expense: FixedExpense;
  editUrlPrefix: string;
  deleteAction: (id: string) => Promise<void>;
  markAsPaidAction: (payload: {
    id: string;
    dueDate: string;
  }) => Promise<boolean>;
}) {
  const expenseId = getFixedExpenseEditId(expense);

  return (
    <MobileListCard
      title={expense.name}
      meta={`Vencimento: ${formatShortDate(expense.dueDate)}`}
      amount={formatCurrency(expense.amount)}
      amountClassName="text-red-600 dark:text-red-400"
      footerLeft={
        <div className="flex items-center space-x-2">
          <StatusBadge tone="blue">{expense.recurrence}</StatusBadge>
          <FixedExpensePaymentBadge expense={expense} />
        </div>
      }
      actions={
        <FixedExpenseActions
          expense={expense}
          editHref={`${editUrlPrefix}/${expenseId}`}
          deleteAction={deleteAction}
          markAsPaidAction={markAsPaidAction}
        />
      }
    />
  );
}

function FixedExpenseActions({
  expense,
  editHref,
  deleteAction,
  markAsPaidAction,
}: {
  expense: FixedExpense;
  editHref: string;
  deleteAction: (id: string) => Promise<void>;
  markAsPaidAction: (payload: {
    id: string;
    dueDate: string;
  }) => Promise<boolean>;
}) {
  return (
    <RowActions
      editHref={editHref}
      deleteId={expense.id}
      deleteAction={deleteAction}
      markAsPaidDisabled={expense.isPaid || !expense.id}
      markAsPaidTitle={expense.isPaid ? "Já pago" : "Marcar como pago"}
      onMarkAsPaid={() =>
        expense.id &&
        markAsPaidAction({ id: expense.id, dueDate: expense.dueDate })
      }
    />
  );
}

function FixedExpensePaymentBadge({ expense }: { expense: FixedExpense }) {
  return expense.isPaid ? (
    <StatusBadge tone="green">Pago</StatusBadge>
  ) : (
    <StatusBadge tone="yellow">Pendente</StatusBadge>
  );
}

function getFixedExpenseEditId(expense: FixedExpense) {
  return expense.id || encodeURIComponent(`${expense.name}-${expense.amount}`);
}

function getFixedExpenseKey(expense: FixedExpense) {
  return expense.id || `${expense.name}-${expense.amount}`;
}
