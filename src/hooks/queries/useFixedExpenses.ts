"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { createFixedExpenseAction } from "@/actions/fixed-expense/create-fixed-expense-action";
import { deleteFixedExpenseAction } from "@/actions/fixed-expense/delete-fixed-expense-action";
import { markFixedExpenseAsPaidAction } from "@/actions/fixed-expense/mark-fixed-expense-as-paid-action";
import { getFixedExpenses } from "@/actions/fixed-expense/fixed-expenses";
import { updateFixedExpenseAction } from "@/actions/fixed-expense/update-fixed-expense-action";
import { CATEGORY_LABELS } from "@/constants/transaction-categories";
import type {
  FixedExpense,
  FixedExpensePaymentResult,
} from "@/models/fixed-expense.model";
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
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
  queryClient.invalidateQueries({
    queryKey: queryKeys.dashboard.monthlyComparison(),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.dashboard.sixMonthComparison(),
  });
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
    onError: (error: Error) => {
      toast.error(error.message || "Falha ao criar despesa fixa");
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

export function useUpdateFixedExpense() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateFixedExpenseAction,
    onSuccess: () => {
      toast.success("Despesa fixa atualizada com sucesso!");
      invalidateFixedExpenseViews(queryClient);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Falha ao atualizar despesa fixa");
    },
  });

  return {
    updateFixedExpense: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useMarkFixedExpenseAsPaid() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, isPaid }: { id: string; isPaid: boolean }) =>
      markFixedExpenseAsPaidAction({ id, isPaid }),
    onSuccess: (result) => {
      toast.success(getPaymentSuccessMessage(result));
      invalidatePaymentViews(queryClient);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Falha ao marcar despesa como paga");
    },
  });

  return {
    markAsPaid: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

function getPaymentSuccessMessage(result: FixedExpensePaymentResult) {
  const transaction = result.transaction;
  const isPaid = result.fixedExpense.isPaid;

  if (!isPaid) {
    return "Pagamento desmarcado e transação removida.";
  }

  if (transaction) {
    const category =
      CATEGORY_LABELS[transaction.category as keyof typeof CATEGORY_LABELS] ??
      transaction.category;

    return `Despesa paga e transação de ${category} criada.`;
  }

  return "Despesa marcada como paga.";
}
