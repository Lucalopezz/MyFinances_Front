"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { createBudget, deleteBudget, getBudgetSummary, updateBudget } from "@/actions/budget/budgets";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LABELS, EXPENSE_CATEGORIES } from "@/constants/transaction-categories";
import { queryKeys } from "@/hooks/queries/query-keys";
import type { MonthlyBudgetSummary } from "@/models/budget.model";
import { budgetSchema, type BudgetFormValues } from "@/schemas/budget.schema";
import { formatCurrency, formatMonthLabel } from "@/utils/formatters";

type BudgetSectionProps = {
  initialMonth: string;
  initialData: MonthlyBudgetSummary[];
};

export function BudgetSection({ initialMonth, initialData }: BudgetSectionProps) {
  const [month, setMonth] = useState(initialMonth);
  const [editing, setEditing] = useState<MonthlyBudgetSummary | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.budgets.month(month),
    queryFn: async () => {
      const result = await getBudgetSummary(month);
      if (result === null) throw new Error("Orçamentos ainda não estão disponíveis.");
      return result;
    },
    initialData: month === initialMonth ? initialData : undefined,
    retry: false,
  });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() });
  };
  const saveMutation = useMutation({
    mutationFn: async (values: BudgetFormValues) =>
      editing ? updateBudget(editing.id, values) : createBudget(values),
    onSuccess: () => {
      toast.success(editing ? "Orçamento atualizado." : "Orçamento criado.");
      setIsFormOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (failure: Error) => toast.error(failure.message),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      toast.success("Orçamento removido.");
      invalidate();
    },
    onError: (failure: Error) => toast.error(failure.message),
  });

  function openForm(budget: MonthlyBudgetSummary | null) {
    setEditing(budget);
    setIsFormOpen(true);
  }

  return (
    <section className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900" aria-labelledby="budgets-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="budgets-title" className="text-lg font-semibold">Orçamento do mês</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Defina limites por categoria e acompanhe os gastos reais.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Mês</span>
            <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Mês do orçamento" />
          </label>
          <Button type="button" onClick={() => openForm(null)}><Plus aria-hidden="true" /> Novo orçamento</Button>
        </div>
      </div>
      {isPending ? <p className="text-sm text-gray-500">Carregando orçamentos...</p> : null}
      {isError ? (
        <div role="alert" className="rounded-lg border border-red-200 p-4 text-sm text-red-700 dark:border-red-900 dark:text-red-300">
          {error instanceof Error ? error.message : "Não foi possível carregar os orçamentos."}{" "}
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>Tentar novamente</Button>
        </div>
      ) : null}
      {data?.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-sm text-gray-500">Nenhum orçamento para {formatMonthLabel(month)}.</p> : null}
      {data && data.length > 0 ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {data.map((budget) => {
            const ratio = budget.limitAmount > 0 ? budget.spentAmount / budget.limitAmount : 0;
            const tone = ratio >= 1 ? "bg-red-500" : ratio >= 0.8 ? "bg-amber-500" : "bg-emerald-500";
            return (
              <li key={budget.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{CATEGORY_LABELS[budget.category]}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Gasto {formatCurrency(budget.spentAmount)} de {formatCurrency(budget.limitAmount)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" aria-label={`Editar orçamento de ${CATEGORY_LABELS[budget.category]}`} onClick={() => openForm(budget)}><Pencil className="size-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Excluir orçamento de ${CATEGORY_LABELS[budget.category]}`} disabled={deleteMutation.isPending} onClick={() => { if (window.confirm("Excluir este orçamento?")) deleteMutation.mutate(budget.id); }}><Trash2 className="size-4" /></Button>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700" role="progressbar" aria-valuenow={Math.min(100, Math.round(ratio * 100))} aria-valuemin={0} aria-valuemax={100} aria-label={`Uso do orçamento de ${CATEGORY_LABELS[budget.category]}`}>
                  <div className={`h-full ${tone}`} style={{ width: `${Math.min(100, Math.max(0, ratio * 100))}%` }} />
                </div>
                <p className={`mt-2 text-sm font-medium ${ratio >= 1 ? "text-red-600 dark:text-red-400" : ratio >= 0.8 ? "text-amber-700 dark:text-amber-400" : "text-gray-700 dark:text-gray-300"}`}>
                  {budget.remainingAmount >= 0 ? `Restam ${formatCurrency(budget.remainingAmount)}` : `Limite excedido em ${formatCurrency(-budget.remainingAmount)}`}
                </p>
              </li>
            );
          })}
        </ul>
      ) : null}
      <BudgetDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        month={month}
        budget={editing}
        onSubmit={(values) => saveMutation.mutateAsync(values)}
        isSaving={saveMutation.isPending}
      />
    </section>
  );
}

function BudgetDialog({ open, onOpenChange, month, budget, onSubmit, isSaving }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
  budget: MonthlyBudgetSummary | null;
  onSubmit: (values: BudgetFormValues) => Promise<unknown>;
  isSaving: boolean;
}) {
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      monthKey: budget?.monthKey ?? month,
      category: budget?.category ?? EXPENSE_CATEGORIES[0],
      limitAmount: budget?.limitAmount ?? 0,
    },
  });
  const { reset } = form;
  useEffect(() => {
    if (open) reset({
      monthKey: budget?.monthKey ?? month,
      category: budget?.category ?? EXPENSE_CATEGORIES[0],
      limitAmount: budget?.limitAmount ?? 0,
    });
  }, [open, budget, month, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{budget ? "Editar orçamento" : "Novo orçamento"}</DialogTitle>
          <DialogDescription>Escolha a categoria e o limite para o mês.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => { try { await onSubmit(values); } catch { /* O erro já foi exibido. */ } })}>
          <label className="block text-sm font-medium">Mês
            <Input className="mt-1" type="month" {...form.register("monthKey")} aria-invalid={Boolean(form.formState.errors.monthKey)} />
            {form.formState.errors.monthKey && <span className="text-xs text-red-600">{form.formState.errors.monthKey.message}</span>}
          </label>
          <div>
            <span className="mb-1 block text-sm font-medium">Categoria</span>
            <Controller control={form.control} name="category" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-label="Categoria do orçamento"><SelectValue /></SelectTrigger>
                <SelectContent>{EXPENSE_CATEGORIES.map((category) => <SelectItem key={category} value={category}>{CATEGORY_LABELS[category]}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          </div>
          <label className="block text-sm font-medium">Limite (R$)
            <Input className="mt-1" type="number" inputMode="decimal" min="0.01" step="0.01" {...form.register("limitAmount", { valueAsNumber: true })} aria-invalid={Boolean(form.formState.errors.limitAmount)} />
            {form.formState.errors.limitAmount && <span className="text-xs text-red-600">{form.formState.errors.limitAmount.message}</span>}
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Salvando..." : "Salvar orçamento"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
