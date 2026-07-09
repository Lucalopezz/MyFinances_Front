"use client";
import { useState } from "react";
import { TransactionDialog } from "@/components/dashboard/transaction-dialog";
import type { Transaction } from "@/models/transaction.model";
import { useCreateTransaction } from "@/hooks/queries/useCreateTransaction";
import SummaryCard from "@/components/summary-card";
import { formatCurrency } from "@/utils/formatters";
import { useTransactions } from "@/hooks/queries/useTransactions";

interface TransactionSummaryProps {
  transactions: Transaction[];
  onTransactionAdded?: (transaction: Transaction) => void;
}

export function TransactionSummary({
  transactions,
  onTransactionAdded,
}: TransactionSummaryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { createTransactionAsync, isLoading } = useCreateTransaction();
  const { data: currentTransactions = [] } = useTransactions(transactions);

  const totalIncome = currentTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.value, 0);

  const totalExpense = currentTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.value, 0);

  const balance = totalIncome - totalExpense;
  const summaryCards = [
    {
      title: "Saldo",
      content: formatCurrency(balance),
      className:
        "bg-green-50 dark:bg-green-800/50 border-green-100 dark:border-green-800/50",
      valueClassName:
        balance >= 0
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
    },
    {
      title: "Entradas",
      content: formatCurrency(totalIncome),
      className:
        "bg-blue-50 dark:bg-blue-800/50 border-blue-100 dark:border-blue-800/50",
      valueClassName: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Saídas",
      content: formatCurrency(totalExpense),
      className:
        "bg-red-50 dark:bg-red-800/50 border-red-100 dark:border-red-800/50",
      valueClassName: "text-red-600 dark:text-red-400",
    },
  ];

  const handleTransactionSubmit = async (transaction: Transaction) => {
    const createdTransaction = await createTransactionAsync(transaction);

    if (createdTransaction && onTransactionAdded) {
      onTransactionAdded(createdTransaction);
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resumo Financeiro</h2>
        <TransactionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleTransactionSubmit}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
