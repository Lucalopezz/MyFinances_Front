"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { DialogFormActions } from "@/components/common/dialog-form-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import {
  CATEGORY_BY_TYPE,
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
  type TransactionCategory,
} from "@/constants/transaction-categories";
import { TransactionFormFields } from "@/components/transaction/transaction-form-fields";
import type {
  Transaction,
  TransactionFormValues,
} from "@/models/transaction.model";
import { parseDateOnly } from "@/utils/date";

export type { Transaction } from "@/models/transaction.model";

const TransactionSchema = z.object({
  type: z.enum([TRANSACTION_TYPES.EXPENSE, TRANSACTION_TYPES.INCOME]),
  value: z.coerce.number().positive("Valor deve ser positivo"),
  date: z.date(),
  category: z.enum(TRANSACTION_CATEGORIES),
  description: z.string().default(""),
});

type TransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (transaction: Transaction) => void | Promise<void>;
  loading: boolean;
  mode?: "create" | "edit";
  transaction?: Transaction;
  showTrigger?: boolean;
};

function getInitialValues(transaction?: Transaction): TransactionFormValues {
  const type = transaction?.type ?? TRANSACTION_TYPES.EXPENSE;
  const categories = CATEGORY_BY_TYPE[type] as readonly TransactionCategory[];
  const fallbackCategory = categories[0];
  const category = transaction?.category as TransactionCategory | undefined;

  return {
    type,
    value: transaction?.value ?? 0,
    date: transaction?.date ? parseDateOnly(transaction.date) : new Date(),
    category: categories.includes(category as TransactionCategory)
      ? (category as TransactionCategory)
      : fallbackCategory,
    description: transaction?.description ?? "",
  };
}

export const TransactionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  loading,
  mode = "create",
  transaction,
  showTrigger = true,
}: TransactionDialogProps) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: getInitialValues(transaction),
  });

  useEffect(() => {
    if (open) {
      reset(getInitialValues(transaction));
    }
  }, [open, reset, transaction]);

  const currentType = watch("type");

  useEffect(() => {
    const allowedCategories = CATEGORY_BY_TYPE[
      currentType
    ] as readonly TransactionCategory[];
    const currentCategory = getValues("category") as TransactionCategory;

    if (!allowedCategories.includes(currentCategory)) {
      setValue("category", allowedCategories[0], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [currentType, getValues, setValue]);

  const handleFormSubmit = async (data: TransactionFormValues) => {
    const payload: Transaction = {
      ...data,
      value: data.value,
      date: format(data.date, "yyyy-MM-dd"),
    };

    try {
      await onSubmit(payload);
      reset(getInitialValues(transaction));
      onOpenChange(false);
    } catch {
      // A mutation exibe a mensagem pública normalizada pela camada da API.
    }
  };

  const title =
    mode === "edit" ? "Editar transação" : "Adicionar nova transação";
  const description =
    mode === "edit"
      ? "Atualize os dados abaixo e salve as alterações no mesmo modal."
      : "Registre receitas e despesas sem sair da página.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400">
            {mode === "edit" ? "Editar transação" : "Adicionar transação"}
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent
        className={cn(
          "sm:max-w-[680px]",
          "border-slate-200 bg-white text-slate-900 shadow-2xl",
          "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50",
          "rounded-2xl",
        )}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </DialogTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="grid gap-6 py-2"
        >
          <TransactionFormFields
            control={control}
            register={register}
            setValue={setValue}
            errors={errors}
          />

          <DialogFormActions
            onCancel={() => onOpenChange(false)}
            isLoading={loading}
            submitLabel={
              mode === "edit" ? "Salvar alterações" : "Salvar transação"
            }
            className="border-t border-slate-200 dark:border-slate-800"
            cancelClassName="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-white"
            submitClassName="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
