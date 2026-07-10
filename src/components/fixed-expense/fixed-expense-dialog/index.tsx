"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useCreateFixedExpense,
  useUpdateFixedExpense,
} from "@/hooks/queries/useFixedExpenses";
import { DialogFormActions } from "@/components/common/dialog-form-actions";
import {
  CATEGORY_CONFIG,
  FIXED_EXPENSE_CATEGORIES,
} from "@/constants/transaction-categories";
import type { FixedExpense } from "@/models/fixed-expense.model";

interface FixedExpenseDialogProps {
  setOpen: (open: boolean) => void;
  fixedExpense?: FixedExpense;
}

const formSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  amount: z.number().min(0.01, { message: "Valor deve ser maior que zero" }),
  category: z.enum(FIXED_EXPENSE_CATEGORIES),
  dueDate: z.string().min(1, { message: "Selecione uma data de vencimento" }),
  recurrence: z.string().min(1, { message: "Selecione a recorrência" }),
});

function getInitialValues(fixedExpense?: FixedExpense): FormData {
  return {
    name: fixedExpense?.name ?? "",
    amount: fixedExpense?.amount ?? 0,
    category: fixedExpense?.category ?? "UTILITIES",
    dueDate: fixedExpense?.dueDate
      ? new Date(fixedExpense.dueDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    recurrence: fixedExpense?.recurrence ?? "MONTHLY",
  };
}

type FormData = z.infer<typeof formSchema>;

export function FixedExpenseDialog({
  setOpen,
  fixedExpense,
}: FixedExpenseDialogProps) {
  const { createFixedExpense, isLoading } = useCreateFixedExpense();
  const { updateFixedExpense, isLoading: isUpdating } = useUpdateFixedExpense();
  const isEditing = Boolean(fixedExpense?.id);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues(fixedExpense),
  });

  useEffect(() => {
    form.reset(getInitialValues(fixedExpense));
  }, [fixedExpense, form]);

  async function onSubmit(data: FormData) {
    try {
      if (fixedExpense?.id) {
        await updateFixedExpense({
          id: fixedExpense.id,
          fixedExpense: data,
        });
      } else {
        await createFixedExpense(data);
      }

      setOpen(false);
    } catch {
      // O hook exibe o erro retornado pela API.
    }
  }

  return (
    <DialogContent
      className={cn(
        "sm:max-w-[425px]",
        "bg-[#2C3344] border-none",
        "text-white",
        "rounded-lg",
      )}
    >
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar despesa fixa" : "Nova despesa fixa"}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Aluguel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="1500.00"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de vencimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria da transação</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FIXED_EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {CATEGORY_CONFIG[category].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recurrence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recorrência</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a recorrência" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFormActions
            onCancel={() => setOpen(false)}
            isLoading={isLoading || isUpdating}
            submitLabel={isEditing ? "Salvar" : "Criar"}
            loadingLabel={isEditing ? "Salvando..." : "Criando..."}
            className="gap-2"
          />
        </form>
      </Form>
    </DialogContent>
  );
}
