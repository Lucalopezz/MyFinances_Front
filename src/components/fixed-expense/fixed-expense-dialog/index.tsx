"use client";

import { useEffect, useState } from "react";
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
import { CategorySelect } from "@/components/category/category-select";
import { categoryReferenceSchema } from "@/schemas/category.schema";
import type { FixedExpense } from "@/models/fixed-expense.model";
import { toDateInputValue } from "@/utils/date";

import { getCards } from "@/actions/cards/cards";
import type { CreditCard } from "@/models/card.model";
import { formatCurrency } from "@/utils/formatters";

interface FixedExpenseDialogProps {
  setOpen: (open: boolean) => void;
  fixedExpense?: FixedExpense;
}

const formSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  amount: z.number().min(0.01, { message: "Valor deve ser maior que zero" }),
  category: categoryReferenceSchema,
  dueDate: z.string().min(1, { message: "Selecione uma data de vencimento" }),
  cardId: z.string().nullable().optional(),
  cardInstallments: z
    .number()
    .int()
    .min(1, "Informe pelo menos uma parcela")
    .max(60, "Use até 60 parcelas"),
  recurrence: z.string().min(1, { message: "Selecione a recorrência" }),
});

function getInitialValues(fixedExpense?: FixedExpense): FormData {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    cardId: fixedExpense?.cardId ?? null,
    cardInstallments: fixedExpense?.cardInstallments ?? 1,
    name: fixedExpense?.name ?? "",
    amount: fixedExpense?.amount ?? 0,
    category: fixedExpense?.category ?? "UTILITIES",
    dueDate: fixedExpense?.dueDate
      ? toDateInputValue(fixedExpense.dueDate)
      : toDateInputValue(tomorrow),
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
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [cardError, setCardError] = useState("");
  const [loadingCards, setLoadingCards] = useState(true);
  const isEditing = Boolean(fixedExpense?.id);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues(fixedExpense),
  });

  useEffect(() => {
    form.reset(getInitialValues(fixedExpense));
  }, [fixedExpense, form]);

  useEffect(() => {
    // Este formulário só é montado ao abrir. Cada abertura faz uma leitura
    // atual dos cartões e permite tentar novamente após uma falha anterior.
    // O token permanece no servidor; fechar descarta a resposta em andamento.
    let active = true;
    getCards()
      .then((items) => {
        if (active) setCards(items);
      })
      .catch(() => {
        if (active)
          setCardError(
            "Não foi possível carregar os cartões. Tente abrir o formulário novamente.",
          );
      })
      .finally(() => {
        if (active) setLoadingCards(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const cardId = form.watch("cardId");
  const total = form.watch("amount");
  const installments = form.watch("cardInstallments");

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
        "max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-4rem)]",
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
                <FormLabel>
                  {cardId ? "Valor total da contratação" : "Valor"}
                </FormLabel>
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
                <FormLabel>
                  {cardId ? "Data da renovação" : "Data de vencimento"}
                </FormLabel>
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
                <CategorySelect
                  type="EXPENSE"
                  value={field.value}
                  onChange={field.onChange}
                  preservedId={fixedExpense?.category}
                />
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

          <FormField
            control={form.control}
            name="cardId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forma de pagamento</FormLabel>
                <Select
                  value={field.value ?? "direct"}
                  onValueChange={(value) =>
                    field.onChange(value === "direct" ? null : value)
                  }
                  disabled={loadingCards || Boolean(fixedExpense?.isPaid)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o pagamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="direct">Pagamento direto</SelectItem>
                    {cards.map((card) => (
                      <SelectItem
                        key={card.id}
                        value={card.id}
                        disabled={card.archived}
                      >
                        {card.name}
                        {card.archived ? " (arquivado)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {cardError && (
            <p role="alert" className="text-sm text-red-300">
              {cardError}
            </p>
          )}
          {cardId && (
            <>
              <FormField
                control={form.control}
                name="cardInstallments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parcelas no cartão</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        disabled={Boolean(fixedExpense?.isPaid)}
                        value={field.value}
                        onChange={(event) =>
                          field.onChange(Number(event.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-sm text-slate-300">
                Até{" "}
                {formatCurrency(
                  Math.ceil((total * 100) / Math.max(1, installments)) / 100,
                )}{" "}
                por parcela. Confirme a compra a cada renovação; o saldo muda
                quando a fatura é paga.
              </p>
            </>
          )}
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
