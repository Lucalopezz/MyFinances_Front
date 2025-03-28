"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Transaction, TransactionDialog } from "./TransactionDialog";
import { useCreateTransaction } from '@/hooks/queries/useCreateTransaction';

const DashboardActions = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {createTransaction, isLoading} = useCreateTransaction()

  const handleAddTransaction = (transaction: Transaction) => {

    createTransaction(transaction)
    
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
        <Badge variant="outline" className="text-emerald-600 border-emerald-600">
          Status: Ativo
        </Badge>
      </div>
    </>
  );
};

export default DashboardActions;