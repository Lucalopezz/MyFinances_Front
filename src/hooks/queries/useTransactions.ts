"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { createTransactionAction } from "@/actions/transaction/create-transaction-action";
import { deleteTransactionAction } from "@/actions/transaction/delete-transaction-action";
import { getTransactions } from "@/actions/transaction/transactions";
import { updateTransactionAction } from "@/actions/transaction/update-transaction-action";
import type { PaginatedTransactions } from "@/models/transaction.model";
import { queryKeys } from "@/hooks/queries/query-keys";

function invalidateTransactionViews(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useTransactions(
  page: number,
  initialData?: PaginatedTransactions,
) {
  return useQuery({
    queryKey: queryKeys.transactions.page(page),
    queryFn: () => getTransactions(page),
    initialData,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTransactionAction,
    onSuccess: () => {
      toast.success("Transação criada com sucesso!");
      invalidateTransactionViews(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    createTransaction: mutation.mutate,
    createTransactionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? "",
  };
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateTransactionAction,
    onSuccess: () => {
      toast.success("Transação atualizada com sucesso!");
      invalidateTransactionViews(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    updateTransaction: mutation.mutate,
    updateTransactionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? "",
  };
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteTransactionAction,
    onSuccess: () => {
      invalidateTransactionViews(queryClient);
    },
  });

  return {
    deleteTransaction: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
