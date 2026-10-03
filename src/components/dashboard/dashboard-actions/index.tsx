"use client";

import { useState } from "react";
import { TransactionDialog } from "../transaction-dialog";
import type { Transaction } from "@/models/transaction.model";
import { useCreateTransaction } from "@/hooks/queries/useCreateTransaction";

const DashboardActions = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { createTransactionAsync, isLoading } = useCreateTransaction();

  const handleAddTransaction = async (transaction: Transaction) => {
    await createTransactionAsync(transaction);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex shrink-0 [&_button]:w-full sm:[&_button]:w-auto">
      <TransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        loading={isLoading}
        onSubmit={handleAddTransaction}
      />
    </div>
  );
};

export default DashboardActions;
