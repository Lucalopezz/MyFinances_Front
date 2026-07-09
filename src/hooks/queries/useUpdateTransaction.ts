import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { queryClient } from "../useQueryClient";
import type { Transaction } from "@/models/transaction.model";
import { updateTransactionAction } from "@/actions/transaction/update-transaction-action";

export function useUpdateTransaction() {
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async ({
      id,
      transaction,
    }: {
      id: string;
      transaction: Transaction;
    }) => {
      try {
        return await updateTransactionAction({ id, transaction });
      } catch (error: unknown) {
        if (error instanceof Error) throw error;
        throw new Error("Erro ao atualizar transação");
      }
    },
    onSuccess: () => {
      toast.success("Transação atualizada com sucesso!");
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      queryClient.invalidateQueries({
        queryKey: ["monthlyComparison"],
      });
    },
    onError: (err: Error) => {
      setError(err.message || "Algo deu errado");
    },
  });

  return {
    updateTransaction: mutation.mutate,
    updateTransactionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error,
  };
}
