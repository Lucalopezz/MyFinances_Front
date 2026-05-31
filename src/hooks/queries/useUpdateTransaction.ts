import api from "@/utils/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { queryClient } from "../useQueryClient";
import { revalidateTransactionsCache } from "@/actions/cache";
import type { Transaction } from "@/components/transaction/transaction.types";

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
        const response = await api.patch(`/transactions/${id}`, transaction);
        await revalidateTransactionsCache();
        return response.data;
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(
            error.response.data.message || "Erro ao atualizar transação",
          );
        }

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
