"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { createFixedExpenseAction } from "@/actions/fixed-expense/create-fixed-expense-action";
import { deleteFixedExpenseAction } from "@/actions/fixed-expense/delete-fixed-expense-action";
import { markFixedExpenseAsPaidAction } from "@/actions/fixed-expense/mark-fixed-expense-as-paid-action";
import { getFixedExpenses } from "@/actions/fixed-expense/fixed-expenses";
import type { FixedExpense } from "@/models/fixed-expense.model";
import { queryKeys } from "@/hooks/queries/query-keys";

function invalidateFixedExpenseViews(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.fixedExpenses.all() });
}

function invalidatePaymentViews(queryClient: ReturnType<typeof useQueryClient>) {
  invalidateFixedExpenseViews(queryClient);
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useFixedExpenses(initialData?: FixedExpense[]) {
  return useQuery({
    queryKey: queryKeys.fixedExpenses.all(),
    queryFn: getFixedExpenses,
    initialData,
  });
}

export function useCreateFixedExpense() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createFixedExpenseAction,
    onSuccess: () => {
      toast.success("Despesa fixa criada com sucesso!");
      invalidateFixedExpenseViews(queryClient);
    },
  });

  return {
    createFixedExpense: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useDeleteFixedExpense() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteFixedExpenseAction,
    onSuccess: () => {
      invalidateFixedExpenseViews(queryClient);
    },
  });

  return {
    deleteFixedExpense: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useMarkFixedExpenseAsPaid() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      dueDate,
    }: {
      id: string;
      dueDate: FixedExpense["dueDate"];
    }) => markFixedExpenseAsPaidAction({ id, dueDate }),
    onSuccess: () => {
      toast.success("Despesa marcada como paga!");
      invalidatePaymentViews(queryClient);
    },
  });

  return {
    markAsPaid: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
