"use client";

import { useEffect, useState } from "react";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
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
import { TRANSACTION_TYPES } from "@/constants/transaction-categories";
import { CategorySelect } from "@/components/category/category-select";
import { useCategories } from "@/providers/category-provider";
import { suggestCategory } from "@/actions/category/categories";
import { Button } from "@/components/ui/button";
import type { TransactionFormValues } from "@/models/transaction.model";
import { parseDateOnly, toDateInputValue } from "@/utils/date";

type TransactionFormFieldsProps = {
  control: Control<TransactionFormValues>;
  register: UseFormRegister<TransactionFormValues>;
  setValue: UseFormSetValue<TransactionFormValues>;
  errors: FieldErrors<TransactionFormValues>;
  preservedId?: string;
  suggest?: boolean;
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
  preservedId,
  suggest = true,
}: TransactionFormFieldsProps) {
  const transactionType =
    useWatch({ control, name: "type" }) ?? TRANSACTION_TYPES.EXPENSE;
  const transactionCategory = useWatch({ control, name: "category" });

  const description = useWatch({ control, name: "description" });
  const { categories: catalog, categoryLabel } = useCategories();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestionError, setSuggestionError] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  useEffect(() => {
    const current = catalog.find((item) => item.id === transactionCategory);
    if (
      current &&
      (current.type !== transactionType ||
        (current.archived && current.id !== preservedId))
    ) {
      setValue("category", "", { shouldValidate: true });
    }
  }, [catalog, transactionCategory, transactionType, preservedId, setValue]);
  useEffect(() => {
    setSuggestion(null);
    setSuggestionError(false);
    setSuggesting(false);
    if (!suggest || !description?.trim()) return;
    let active = true;
    const timer = setTimeout(async () => {
      setSuggesting(true);
      try {
        const result = await suggestCategory(transactionType, description);
        if (active) setSuggestion(result.category);
      } catch {
        if (active) setSuggestionError(true);
      } finally {
        if (active) setSuggesting(false);
      }
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [suggest, description, transactionType]);

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
          <CategorySelect
            type={transactionType}
            value={transactionCategory ?? ""}
            preservedId={preservedId}
            onChange={(value) =>
              setValue("category", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          />
          {suggesting && (
            <p role="status" className="text-xs text-gray-500">
              Consultando regras...
            </p>
          )}
          {suggestionError && (
            <p role="status" className="text-xs text-gray-500">
              Sugestões indisponíveis. Selecione a categoria manualmente.
            </p>
          )}
          {suggestion && suggestion !== transactionCategory && (
            <div className="text-sm">
              <p>Sugestão da regra: {categoryLabel(suggestion)}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setValue("category", suggestion, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                Usar sugestão
              </Button>
            </div>
          )}
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
                value={field.value ? toDateInputValue(field.value) : ""}
                onChange={(event) =>
                  field.onChange(parseDateOnly(event.target.value))
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
