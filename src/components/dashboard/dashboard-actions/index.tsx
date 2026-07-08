"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TransactionDialog } from "../transaction-dialog";
import type { Transaction } from "@/components/transaction/types";
import { useCreateTransaction } from "@/hooks/queries/useCreateTransaction";

const DashboardActions = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { createTransactionAsync, isLoading } = useCreateTransaction();

  const handleAddTransaction = async (transaction: Transaction) => {
    await createTransactionAsync(transaction);
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="mt-6 flex justify-center sm:justify-start">
        <TransactionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          loading={isLoading}
          onSubmit={handleAddTransaction}
        />
      </div>

      <div className="mt-4 flex justify-center sm:justify-start">
        <Badge
          variant="outline"
          className="text-emerald-600 border-emerald-600"
        >
          Status: Ativo
        </Badge>
      </div>
    </>
  );
};

export default DashboardActions;
