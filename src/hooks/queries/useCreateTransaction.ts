import type { Transaction } from "@/models/transaction.model";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { queryClient } from "../useQueryClient";
import { createTransactionAction } from "@/actions/transaction/create-transaction-action";

export function useCreateTransaction() {
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: Transaction) => {
      try {
        return await createTransactionAction(data);
      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Erro ao criar transição");
      }
    },
    onSuccess: () => {
      toast.success("Transição criada com sucesso!");
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
    createTransaction: mutation.mutate,
    createTransactionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error,
  };
}
