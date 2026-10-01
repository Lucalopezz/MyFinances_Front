"use client";
import { useEffect, useState } from "react";
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
  TRANSACTION_TYPES,
} from "@/constants/transaction-categories";
import { categoryReferenceSchema } from "@/schemas/category.schema";
import { TransactionFormFields } from "@/components/transaction/transaction-form-fields";
import type {
  Transaction,
  TransactionFormValues,
} from "@/models/transaction.model";
import { parseDateOnly } from "@/utils/date";
import { getCards } from "@/actions/cards/cards";
import type { CreditCard } from "@/models/card.model";
import { Input } from "@/components/ui/input";

export type { Transaction } from "@/models/transaction.model";

const TransactionSchema = z
  .object({
    type: z.enum([TRANSACTION_TYPES.EXPENSE, TRANSACTION_TYPES.INCOME]),
    value: z.coerce.number().positive("Valor deve ser positivo"),
    date: z.date(),
    category: categoryReferenceSchema,
    description: z.string().default(""),
    paymentMethod: z.enum(["CASH", "CREDIT"]),
    cardId: z.string().optional(),
    installments: z.coerce.number().int().min(1).max(60),
  })
  .refine(
    (value) =>
      value.type !== "EXPENSE" ||
      value.paymentMethod !== "CREDIT" ||
      !!value.cardId,
    { path: ["cardId"], message: "Selecione um cartão." },
  );

type TransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (transaction: Transaction) => void | Promise<void>;
  loading: boolean;
  mode?: "create" | "edit" | "duplicate";
  transaction?: Transaction;
  showTrigger?: boolean;
};

function getInitialValues(
  transaction?: Transaction,
  mode: "create" | "edit" | "duplicate" = "create",
): TransactionFormValues {
  const type = transaction?.type ?? TRANSACTION_TYPES.EXPENSE;

  return {
    type,
    value: transaction?.value ?? 0,
    date:
      mode === "duplicate" || !transaction?.date
        ? new Date()
        : parseDateOnly(transaction.date),
    category: transaction?.category ?? CATEGORY_BY_TYPE[type][0],
    description: transaction?.description ?? "",
    paymentMethod: "CASH",
    cardId: "",
    installments: 1,
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
  const [cards, setCards] = useState<CreditCard[]>([]);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: getInitialValues(transaction, mode),
  });

  useEffect(() => {
    if (open) {
      reset(getInitialValues(transaction, mode));
    }
  }, [open, reset, transaction, mode]);
  useEffect(() => {
    if (open && mode !== "edit")
      getCards()
        .then(setCards)
        .catch(() => setCards([]));
  }, [open, mode]);
  const isCredit =
    watch("paymentMethod") === "CREDIT" && watch("type") === "EXPENSE";

  const handleFormSubmit = async (data: TransactionFormValues) => {
    const payload: Transaction = {
      ...data,
      value: data.value,
      date: format(data.date, "yyyy-MM-dd"),
    };

    try {
      await onSubmit(payload);
      reset(getInitialValues(transaction, mode));
      onOpenChange(false);
    } catch {
      // A mutation exibe a mensagem pública normalizada pela camada da API.
    }
  };

  const title =
    mode === "edit"
      ? "Editar transação"
      : mode === "duplicate"
        ? "Duplicar transação"
        : "Adicionar nova transação";
  const description =
    mode === "edit"
      ? "Atualize os dados abaixo e salve as alterações no mesmo modal."
      : mode === "duplicate"
        ? "Revise os dados e confirme para criar uma nova transação."
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
          "max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-4rem)]",
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
            preservedId={mode === "edit" ? transaction?.category : undefined}
            suggest={mode !== "edit"}
            key={`${open}-${mode}-${transaction?.id ?? "new"}`}
          />
          {mode !== "edit" && watch("type") === "EXPENSE" && (
            <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <label className="grid gap-2 text-sm font-medium">
                Forma de pagamento
                <select
                  className="h-10 rounded-md border bg-white px-3 dark:bg-slate-900"
                  {...register("paymentMethod")}
                >
                  <option value="CASH">À vista</option>
                  <option value="CREDIT">Cartão de crédito</option>
                </select>
              </label>
              {isCredit && (
                <>
                  <label className="grid gap-2 text-sm font-medium">
                    Cartão
                    <select
                      className="h-10 rounded-md border bg-white px-3 dark:bg-slate-900"
                      {...register("cardId")}
                    >
                      <option value="">Selecione um cartão</option>
                      {cards.map((card) => (
                        <option value={card.id} key={card.id}>
                          {card.name} · disponível{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(card.available)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {cards.length === 0 && (
                    <p className="text-sm text-slate-500">
                      Cadastre um cartão na aba Cartões para usar crédito.
                    </p>
                  )}
                  {errors.cardId && (
                    <p role="alert" className="text-sm text-red-600">
                      {errors.cardId.message}
                    </p>
                  )}
                  <label className="grid gap-2 text-sm font-medium">
                    Número de parcelas
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      {...register("installments", { valueAsNumber: true })}
                    />
                  </label>
                  <p className="text-xs text-slate-500">
                    A compra ocupa o limite agora. O saldo realizado muda quando
                    a fatura for paga.
                  </p>
                </>
              )}
            </div>
          )}

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
