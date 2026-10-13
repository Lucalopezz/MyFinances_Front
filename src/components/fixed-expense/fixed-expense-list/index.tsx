"use client";

import Link from "next/link";
import { useState } from "react";
import type { FixedExpense } from "@/models/fixed-expense.model";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  useDeleteFixedExpense,
  useMarkFixedExpenseAsPaid,
} from "@/hooks/queries/useFixedExpenses";
import { MobileListCard } from "@/components/common/mobile-list-card";
import { ResponsiveList } from "@/components/common/responsive-list";
import { RowActions } from "@/components/common/row-actions";
import { StatusBadge } from "@/components/common/status-badge";
import { Dialog } from "@/components/ui/dialog";
import { FixedExpenseDialog } from "@/components/fixed-expense/fixed-expense-dialog";
import { useCategories } from "@/providers/category-provider";
import { formatCurrency, formatShortDate } from "@/utils/formatters";

interface FixedExpenseListProps {
  fixedExpenses: FixedExpense[];
}

export function FixedExpenseList({ fixedExpenses }: FixedExpenseListProps) {
  const { deleteFixedExpense } = useDeleteFixedExpense();
  const { markAsPaid } = useMarkFixedExpenseAsPaid();

  return (
    <ResponsiveList
      items={fixedExpenses}
      getKey={getFixedExpenseKey}
      renderDesktopRow={(expense) => (
        <DesktopFixedExpenseRow
          expense={expense}
          deleteAction={deleteFixedExpense}
          markAsPaidAction={markAsPaid}
        />
      )}
      renderMobileCard={(expense) => (
        <MobileFixedExpenseCard
          expense={expense}
          deleteAction={deleteFixedExpense}
          markAsPaidAction={markAsPaid}
        />
      )}
    />
  );
}

function DesktopFixedExpenseRow({
  expense,
  deleteAction,
  markAsPaidAction,
}: {
  expense: FixedExpense;
  deleteAction: (id: string) => Promise<void>;
  markAsPaidAction: (payload: {
    id: string;
    isPaid: boolean;
  }) => Promise<unknown>;
}) {
  const { categoryLabel } = useCategories();
  return (
    <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
      <TableCell className="py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
        {expense.name}
        {expense.cardId && (
          <Link
            href={`/cards?cardId=${encodeURIComponent(expense.cardId)}`}
            className="block text-xs text-blue-500"
          >
            No cartão · {expense.cardInstallments ?? 1} parcela(s)
          </Link>
        )}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-red-600 dark:text-red-400 font-medium">
        {formatCurrency(expense.amount)}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
        {formatShortDate(expense.dueDate)}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
        {categoryLabel(expense.category)}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <StatusBadge tone="blue">
          {expense.recurrence === "YEARLY" ? "Anual" : "Mensal"}
        </StatusBadge>
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <FixedExpensePaymentBadge expense={expense} />
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <FixedExpenseActions
          expense={expense}
          deleteAction={deleteAction}
          markAsPaidAction={markAsPaidAction}
        />
      </TableCell>
    </TableRow>
  );
}

function MobileFixedExpenseCard({
  expense,
  deleteAction,
  markAsPaidAction,
}: {
  expense: FixedExpense;
  deleteAction: (id: string) => Promise<void>;
  markAsPaidAction: (payload: {
    id: string;
    isPaid: boolean;
  }) => Promise<unknown>;
}) {
  const { categoryLabel } = useCategories();
  return (
    <MobileListCard
      title={expense.name}
      meta={`${expense.cardId ? "Renovação" : "Vencimento"}: ${formatShortDate(expense.dueDate)}${expense.cardId ? ` · ${expense.cardInstallments ?? 1} parcela(s) no cartão` : ""}`}
      amount={formatCurrency(expense.amount)}
      amountClassName="text-red-600 dark:text-red-400"
      footerLeft={
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="blue">
              {expense.recurrence === "YEARLY" ? "Anual" : "Mensal"}
            </StatusBadge>
            <StatusBadge tone="blue">
              {categoryLabel(expense.category)}
            </StatusBadge>
            <FixedExpensePaymentBadge expense={expense} />
          </div>
        </div>
      }
      actions={
        <FixedExpenseActions
          expense={expense}
          deleteAction={deleteAction}
          markAsPaidAction={markAsPaidAction}
        />
      }
    />
  );
}

function FixedExpenseActions({
  expense,
  deleteAction,
  markAsPaidAction,
}: {
  expense: FixedExpense;
  deleteAction: (id: string) => Promise<void>;
  markAsPaidAction: (payload: {
    id: string;
    isPaid: boolean;
  }) => Promise<unknown>;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <RowActions
        onEdit={() => setIsEditOpen(true)}
        editDisabled={!expense.id}
        deleteId={expense.id}
        deleteAction={deleteAction}
        markAsPaidActive={expense.isPaid}
        markAsPaidDisabled={!expense.id || Boolean(expense.paidCardPurchaseId)}
        markAsPaidTitle={
          expense.cardId
            ? expense.isPaid
              ? "Contratação registrada; estorne na tela de cartões"
              : "Registrar compra no cartão"
            : expense.isPaid
              ? "Desmarcar como pago"
              : "Marcar como pago"
        }
        onMarkAsPaid={() =>
          expense.id &&
          markAsPaidAction({ id: expense.id, isPaid: !expense.isPaid })
        }
      />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <FixedExpenseDialog setOpen={setIsEditOpen} fixedExpense={expense} />
      </Dialog>
    </>
  );
}

function FixedExpensePaymentBadge({ expense }: { expense: FixedExpense }) {
  return expense.isPaid ? (
    <StatusBadge tone="green">
      {expense.paidCardPurchaseId ? "Registrado no cartão" : "Pago"}
    </StatusBadge>
  ) : (
    <StatusBadge tone="yellow">Pendente</StatusBadge>
  );
}

function getFixedExpenseKey(expense: FixedExpense) {
  return expense.id || `${expense.name}-${expense.amount}`;
}
