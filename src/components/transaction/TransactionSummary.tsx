"use client";
import { useState } from "react";
import { Transaction, TransactionDialog } from "../dashboard/TransactionDialog";
import { useCreateTransaction } from "@/hooks/queries/useCreateTransaction";
import { useRouter } from "next/navigation";

interface TransactionSummaryProps {
  transactions: Transaction[];
  onTransactionAdded?: (transaction: Transaction) => void;
}

export function TransactionSummary({ 
  transactions, 
  onTransactionAdded 
}: TransactionSummaryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { createTransaction, isLoading: loading } = useCreateTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.value, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.value, 0);

  const balance = totalIncome - totalExpense;

  const handleTransactionSubmit = async (transaction: Transaction) => {
    try {
      await createTransaction(transaction);
      
      if (onTransactionAdded) {
        onTransactionAdded(transaction);
      }
      
      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
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
        {/* Card de Saldo */}
        <div className="bg-green-50 dark:bg-green-800/50 p-4 rounded-lg border border-green-100 dark:border-green-800/50">
          <p className="text-gray-500 dark:text-gray-400">Saldo</p>
          <p className={`text-2xl font-bold ${
            balance >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            R$ {balance.toFixed(2)}
          </p>
        </div>

        {/* Card de Entradas */}
        <div className="bg-blue-50 dark:bg-blue-800/50 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50">
          <p className="text-gray-500 dark:text-gray-400">Entradas</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            R$ {totalIncome.toFixed(2)}
          </p>
        </div>

        {/* Card de Saídas */}
        <div className="bg-red-50 dark:bg-red-800/50 p-4 rounded-lg border border-red-100 dark:border-red-800/50">
          <p className="text-gray-500 dark:text-gray-400">Saídas</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            R$ {totalExpense.toFixed(2)}
          </p>
        </div>
      </div>
      

    </div>
  );
}