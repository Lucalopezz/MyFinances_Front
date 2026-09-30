"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategorySelect } from "@/components/category/category-select";
import {
  recurringIncomeSchema,
  receiptSchema,
  type RecurringIncomeInput,
  type ReceiptInput,
} from "@/schemas/recurring-income.schema";
import {
  saveRecurringIncome,
  confirmIncome,
} from "@/actions/calendar/calendar";
import type { CalendarEvent, RecurringIncome } from "@/models/calendar.model";
import { currentDay, shortDate } from "./calendar-utils";
import { formatCurrency } from "@/utils/formatters";
const fieldClass = "grid gap-2 text-sm font-medium";
export function IncomeDialog({
  income,
  onClose,
  onSaved,
}: {
  income?: RecurringIncome;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [error, setError] = useState("");
  const form = useForm<RecurringIncomeInput>({
    resolver: zodResolver(recurringIncomeSchema),
    defaultValues: income ?? {
      description: "",
      amount: undefined,
      category: "",
      startDate: currentDay(),
      recurrence: "MONTHLY",
      paused: false,
    },
  });
  const submit = form.handleSubmit(async (data) => {
    setError("");
    try {
      await saveRecurringIncome(data, income?.id, income?.revision);
      await onSaved();
      toast.success(
        income ? "Recorrência atualizada." : "Receita recorrente criada.",
      );
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  });
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !form.formState.isSubmitting) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>
            {income ? "Editar receita recorrente" : "Uma entrada para planejar"}
          </DialogTitle>
          <DialogDescription>
            {income
              ? "Alterações valem a partir de amanhã. Recebimentos e pendências anteriores são preservados."
              : "Cadastre a previsão. A receita só entra no saldo registrado quando você confirmar o recebimento."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-5" noValidate>
          <label className={fieldClass}>
            Descrição
            <Input
              placeholder="Ex.: Salário, aluguel recebido"
              maxLength={120}
              {...form.register("description")}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={fieldClass}>
              Valor previsto (R$)
              <Input
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                {...form.register("amount", { valueAsNumber: true })}
              />
            </label>
            <label className={fieldClass}>
              Primeiro recebimento
              <Input type="date" {...form.register("startDate")} />
            </label>
          </div>
          <div className={fieldClass}>
            Categoria
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <CategorySelect
                  type="INCOME"
                  value={field.value}
                  onChange={field.onChange}
                  preservedId={income?.category}
                />
              )}
            />
          </div>
          <label className={fieldClass}>
            Repetir
            <select
              className="h-11 rounded-md border bg-transparent px-3"
              {...form.register("recurrence")}
            >
              <option value="MONTHLY">Todo mês</option>
              <option value="YEARLY">Todo ano</option>
            </select>
          </label>
          <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Nos meses sem o dia escolhido, usamos o último dia do mês. Você
            poderá confirmar um valor diferente do previsto.
          </p>
          {Object.entries(form.formState.errors).map(([key, value]) => (
            <p
              key={key}
              role="alert"
              className="text-sm text-red-600 dark:text-red-400"
            >
              {value.message}
            </p>
          ))}
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={form.formState.isSubmitting}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Salvar recorrência
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export function ReceiptDialog({
  event,
  onClose,
  onSaved,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [error, setError] = useState("");
  const form = useForm<ReceiptInput>({
    resolver: zodResolver(receiptSchema),
    defaultValues: { amount: event.amount, date: currentDay() },
  });
  const submit = form.handleSubmit(async (data) => {
    setError("");
    try {
      await confirmIncome(event, data);
      await onSaved();
      toast.success("Recebimento registrado nas transações.");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível confirmar.");
    }
  });
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !form.formState.isSubmitting) onClose();
      }}
    >
      <DialogContent className="bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Confirmar recebimento</DialogTitle>
          <DialogDescription>
            {event.description} · previsto para {shortDate(event.dueDate)} ·{" "}
            {formatCurrency(event.amount)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-5" noValidate>
          <label className={fieldClass}>
            Valor recebido (R$)
            <Input
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              {...form.register("amount", { valueAsNumber: true })}
            />
          </label>
          <label className={fieldClass}>
            Data do recebimento
            <Input type="date" max={currentDay()} {...form.register("date")} />
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Uma única transação de receita será criada. Confira os dados: o
            recebimento confirmado fica preservado no histórico.
          </p>
          {Object.entries(form.formState.errors).map(([key, v]) => (
            <p key={key} role="alert" className="text-sm text-red-600">
              {v.message}
            </p>
          ))}
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={form.formState.isSubmitting}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Confirmar recebimento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
