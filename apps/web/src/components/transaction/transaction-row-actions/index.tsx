"use client";

import { useState } from "react";
import { Copy, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "../delete-button";
import { TransactionDialog } from "@/components/dashboard/transaction-dialog";
import type { Transaction } from "@/models/transaction.model";
import { useUpdateTransaction } from "@/hooks/queries/useUpdateTransaction";
import { useCreateTransaction } from "@/hooks/queries/useCreateTransaction";

type TransactionRowActionsProps = {
  transaction: Transaction;
  deleteAction: (id: string) => Promise<void>;
};
// Essa função serve para renderizar as ações de editar e excluir em cada linha da tabela de transações. 
// Ela inclui um botão para abrir o modal de edição e um botão para excluir a transação.
//  O modal de edição é reutilizado tanto para criar quanto para editar transações, e é controlado por um estado local que determina se ele está aberto ou fechado. 
// Quando o modal é aberto, ele é preenchido com os dados da transação atual, permitindo que o usuário faça alterações e salve as atualizações.
export function TransactionRowActions({
  transaction,
  deleteAction,
}: TransactionRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const { updateTransactionAsync, isLoading } = useUpdateTransaction();
  const { createTransactionAsync, isLoading: isCreating } = useCreateTransaction();

  const handleUpdate = async (updatedTransaction: Transaction) => {
    if (!transaction.id) {
      throw new Error("ID da transação não encontrado");
    }

    await updateTransactionAsync({
      id: transaction.id,
      transaction: updatedTransaction,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setIsEditOpen(true)}
        disabled={!transaction.id}
        aria-label="Editar transação"
        title="Editar transação"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setIsDuplicateOpen(true)}
        aria-label="Duplicar transação"
        title="Duplicar transação"
      >
        <Copy className="h-4 w-4" />
      </Button>

      <DeleteButton id={transaction.id} deleteAction={deleteAction} />

      <TransactionDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSubmit={handleUpdate}
        loading={isLoading}
        mode="edit"
        transaction={transaction}
        showTrigger={false}
      />
      <TransactionDialog
        open={isDuplicateOpen}
        onOpenChange={setIsDuplicateOpen}
        onSubmit={async (payload) => { await createTransactionAsync(payload); }}
        loading={isCreating}
        mode="duplicate"
        transaction={transaction}
        showTrigger={false}
      />
    </div>
  );
}
