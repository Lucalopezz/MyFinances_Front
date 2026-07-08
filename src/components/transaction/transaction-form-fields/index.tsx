"use client";

import { useEffect } from "react";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CATEGORY_BY_TYPE,
  CATEGORY_CONFIG,
  TRANSACTION_TYPES,
  type TransactionCategory,
} from "@/constants/transaction-categories";
import type { TransactionFormValues } from "@/components/transaction/types";

type TransactionFormFieldsProps = {
  control: Control<TransactionFormValues>;
  register: UseFormRegister<TransactionFormValues>;
  setValue: UseFormSetValue<TransactionFormValues>;
  errors: FieldErrors<TransactionFormValues>;
};

function FieldMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-red-500">{message}</p>;
}

export function TransactionFormFields({
  control,
  register,
  setValue,
  errors,
}: TransactionFormFieldsProps) {
  // Observa o tipo de transação e a categoria selecionada para garantir que a categoria seja válida para o tipo atual
  const transactionType =
    useWatch({ control, name: "type" }) ?? TRANSACTION_TYPES.EXPENSE;
  const transactionCategory = useWatch({ control, name: "category" });
  // Garante que a categoria selecionada seja válida para o tipo de transação atual
  // Se não for, define a categoria para a primeira categoria válida do tipo atual
  useEffect(() => {
    const allowedCategories = CATEGORY_BY_TYPE[
      transactionType
    ] as readonly TransactionCategory[];
    const currentCategory = transactionCategory as TransactionCategory;

    if (!allowedCategories.includes(currentCategory)) {
      setValue("category", allowedCategories[0], {
        // Marca o campo como sujo para garantir que a validação seja acionada
        // Essa validação ocorre na submissão do formulário
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [setValue, transactionCategory, transactionType]);

  const categories = CATEGORY_BY_TYPE[transactionType];

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-2">
          <Label
            htmlFor="type"
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Tipo
          </Label>
          <Select
            value={transactionType}
            onValueChange={(value) =>
              setValue("type", value as TransactionFormValues["type"], {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="border-slate-300 bg-white text-slate-900 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
              <SelectItem value={TRANSACTION_TYPES.EXPENSE}>Despesa</SelectItem>
              <SelectItem value={TRANSACTION_TYPES.INCOME}>Receita</SelectItem>
            </SelectContent>
          </Select>
          <FieldMessage message={errors.type?.message} />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="category"
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Categoria
          </Label>
          <Select
            value={transactionCategory ?? ""}
            onValueChange={(value) =>
              setValue("category", value as TransactionCategory, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="border-slate-300 bg-white text-slate-900 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent className="max-h-80 border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
              {categories.map((category) => {
                const { label, icon: Icon } = CATEGORY_CONFIG[category];

                return (
                  <SelectItem key={category} value={category}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      <span>{label}</span>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FieldMessage message={errors.category?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="value"
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Valor
          </Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            placeholder="0,00"
            {...register("value", {
              setValueAs: (value) => Number.parseFloat(String(value)),
            })}
            className={cn(
              "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
              errors.value && "border-red-500/70 focus:ring-red-500",
            )}
          />
          <FieldMessage message={errors.value?.message} />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="date"
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Data
          </Label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Input
                id="date"
                type="date"
                value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                onChange={(event) =>
                  field.onChange(new Date(event.target.value))
                }
                className={cn(
                  "border-slate-300 bg-white text-slate-900 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100",
                  errors.date && "border-red-500/70 focus:ring-red-500",
                )}
              />
            )}
          />
          <FieldMessage message={errors.date?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-medium text-slate-900 dark:text-slate-100"
        >
          Descrição
        </Label>
        <Textarea
          id="description"
          placeholder="Descreva a transação"
          {...register("description")}
          className={cn(
            "min-h-28 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
            errors.description && "border-red-500/70 focus:ring-red-500",
          )}
        />
        <FieldMessage message={errors.description?.message} />
      </div>
    </div>
  );
}
