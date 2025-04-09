import { Transaction } from "@/components/dashboard/TransactionDialog";
import api from "@/utils/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { queryClient } from "../useQueryClient";
import { revalidateTransactionsCache } from "@/app/fixed-expenses/_actions";

export function useCreateTransaction() {
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: Transaction) => {
      try {
        const response = await api.post("/transactions", data);
        await revalidateTransactionsCache();
        return response.data;
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(
            error.response.data.message || "Erro ao criar transição"
          );
        }
        throw new Error("Erro ao criar transição");
      }
    },
    onSuccess: () => {
      toast.success("Transição criada com sucesso!");
      queryClient.invalidateQueries({ 
        queryKey: ['dashboard'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['monthlyComparison'] 
      });
    },
    onError: (err: Error) => {
      setError(err.message || "Algo deu errado");
    },
  });

  return {
    createTransaction: mutation.mutate,
    isLoading: mutation.isPending,
    error,
  };
}
