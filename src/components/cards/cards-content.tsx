"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard as CreditCardIcon,
  Plus,
  ReceiptText,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createCard,
  createCardPurchase,
  payCardInvoice,
  removeCard,
  refundCardPurchase,
} from "@/actions/cards/cards";
import type {
  CreditCard,
  CardInput,
  CardPurchaseInput,
} from "@/models/card.model";
import { CategorySelect } from "@/components/category/category-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatCurrency,
  formatShortDate,
  formatMonthLabel,
} from "@/utils/formatters";
import { currentDay } from "@/components/calendar/calendar-utils";

const field =
  "grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-200";
const number = (value: string) => Number(value);
export function CardsContent({
  initialCards,
  initialSelectedId,
}: {
  initialCards: CreditCard[];
  initialSelectedId?: string;
}) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [selectedId, setSelectedId] = useState(
    initialSelectedId ??
      initialCards.find((card) => !card.archived)?.id ??
      initialCards[0]?.id ??
      "",
  );
  const [dialog, setDialog] = useState<
    "card" | "purchase" | "remove" | "refund" | null
  >(null);
  const [cardToRemove, setCardToRemove] = useState<CreditCard | null>(null);
  const [purchaseToRefund, setPurchaseToRefund] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cardForm, setCardForm] = useState<CardInput>({
    name: "",
    limit: 0,
    closingDay: 5,
    dueDay: 12,
    annualFee: 0,
  });
  const [purchase, setPurchase] = useState<CardPurchaseInput>({
    description: "",
    amount: 0,
    date: currentDay(),
    category: "SHOPPING",
    installments: 1,
  });
  // Atualizações de outras telas e navegação por um vínculo de cartão precisam
  // refletir a lista do servidor, inclusive pagamentos e arquivamentos.
  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);
  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);
  const selected = cards.find((card) => card.id === selectedId) ?? cards[0];
  async function reload() {
    const { getCards } = await import("@/actions/cards/cards");
    setCards(await getCards());
    router.refresh();
  }
  async function submitCard(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const card = await createCard(cardForm);
      await reload();
      setSelectedId(card.id);
      setDialog(null);
      toast.success("Cartão cadastrado.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível cadastrar.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function submitPurchase(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await createCardPurchase(selected.id, purchase);
      await reload();
      setDialog(null);
      setPurchase({
        description: "",
        amount: 0,
        date: currentDay(),
        category: "SHOPPING",
        installments: 1,
      });
      toast.success("Compra registrada no cartão.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível registrar.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function pay(cycle: string) {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await payCardInvoice(selected.id, cycle, currentDay());
      await reload();
      toast.success("Fatura paga.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível pagar.");
    } finally {
      setBusy(false);
    }
  }
  /** A confirmação explícita evita estornar a compra ao consultar uma fatura. */
  async function confirmRefund() {
    if (!selected || !purchaseToRefund || busy) return;
    setBusy(true);
    setError("");
    try {
      await refundCardPurchase(selected.id, purchaseToRefund);
      await reload();
      setDialog(null);
      setPurchaseToRefund(null);
      toast.success("Compra estornada. Parcelas pendentes canceladas.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível estornar a compra.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function confirmRemoval() {
    if (!cardToRemove || busy) return;
    setBusy(true);
    setError("");
    try {
      await removeCard(cardToRemove.id);
      await reload();
      setSelectedId("");
      setDialog(null);
      setCardToRemove(null);
      router.refresh();
      toast.success(
        "Cartão arquivado. Você ainda pode pagar as faturas pendentes.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível remover o cartão.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="mx-auto max-w-6xl space-y-7 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Cartões de crédito
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Acompanhe o limite, as parcelas e as faturas até a quitação.
          </p>
        </div>
        <Button
          onClick={() => {
            setError("");
            setDialog("card");
          }}
        >
          <Plus className="mr-2 size-4" />
          Novo cartão
        </Button>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950"
        >
          {error}
        </p>
      )}
      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <CreditCardIcon className="mx-auto mb-3 size-10 text-blue-500" />
          <h2 className="font-semibold">Nenhum cartão cadastrado</h2>
          <p className="mt-1 text-sm text-slate-500">
            Cadastre um cartão para começar a acompanhar suas faturas.
          </p>
        </div>
      ) : (
        <>
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Cartões cadastrados"
          >
            {cards.map((card) => (
              <Button
                key={card.id}
                type="button"
                variant={card.id === selected?.id ? "default" : "outline"}
                onClick={() => setSelectedId(card.id)}
              >
                {card.name}
                {card.archived ? " (arquivado)" : ""}
              </Button>
            ))}
          </div>
          {selected && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Limite total", selected.limit],
                  ["Maior fatura pendente", selected.used],
                  ["Disponível", selected.available],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(value as number)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  Fecha dia {selected.closingDay} · vence dia {selected.dueDay}{" "}
                  · anuidade {formatCurrency(selected.annualFee)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={busy || selected.archived}
                    className="text-red-600 dark:text-red-400"
                    onClick={() => {
                      setError("");
                      setCardToRemove(selected);
                      setDialog("remove");
                    }}
                  >
                    <Trash2 /> Remover cartão
                  </Button>
                  <Button
                    disabled={busy || selected.archived}
                    onClick={() => {
                      setError("");
                      setDialog("purchase");
                    }}
                  >
                    <Plus className="mr-2 size-4" />
                    Compra no crédito
                  </Button>
                </div>
              </div>
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Compras e estornos</h2>
                {selected.purchases.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                  >
                    <div>
                      <p>{item.description}</p>
                      {item.fixedExpenseId && (
                        <Link
                          href="/fixed-expenses"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          Ver despesa fixa e renovação
                        </Link>
                      )}
                      <p className="text-sm text-slate-500">
                        {formatCurrency(item.amount)} · {item.installments}{" "}
                        parcela(s) ·{" "}
                        {item.refundedAt
                          ? `Estornada em ${formatShortDate(item.refundedAt)}`
                          : formatShortDate(item.date)}
                      </p>
                    </div>
                    {!item.refundedAt && (
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={() => {
                          setError("");
                          setPurchaseToRefund(item.id);
                          setDialog("refund");
                        }}
                      >
                        Estornar compra
                      </Button>
                    )}
                  </div>
                ))}
              </section>
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <ReceiptText className="size-5" />
                  Faturas
                </h2>
                {selected.invoices.length === 0 && (
                  <p className="rounded-xl border p-5 text-sm text-slate-500">
                    Ainda não há faturas para este cartão.
                  </p>
                )}
                {[...selected.invoices].reverse().map((invoice) => (
                  <article
                    key={invoice.cycle}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">
                          {formatMonthLabel(invoice.cycle)}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Fecha em {formatShortDate(invoice.closingDate)} ·
                          vence em {formatShortDate(invoice.dueDate)} ·{" "}
                          {invoice.paid
                            ? `Paga em ${formatShortDate(invoice.paymentDate ?? undefined)}`
                            : invoice.status === "OVERDUE"
                              ? "Vencida"
                              : "Pendente"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatCurrency(invoice.total)}
                        </p>
                        {!invoice.paid &&
                          invoice.closingDate <= currentDay() && (
                            <Button
                              size="sm"
                              disabled={busy}
                              onClick={() => pay(invoice.cycle)}
                            >
                              Marcar como paga
                            </Button>
                          )}
                      </div>
                    </div>
                    {invoice.paid && invoice.transactionIds?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        {invoice.transactionIds.map((id, index) => (
                          <Link
                            key={id}
                            href={`/transactions/${encodeURIComponent(id)}`}
                            className="text-blue-500 hover:underline"
                          >
                            Ver lançamento {index + 1}
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                      {invoice.lines.map((line) => (
                        <div
                          key={line.id}
                          className="flex justify-between gap-3 py-2 text-sm"
                        >
                          <span>
                            {line.description}{" "}
                            <span className="text-slate-500">
                              {line.number}/{line.installments}
                            </span>
                          </span>
                          <span>{formatCurrency(line.amount)}</span>
                        </div>
                      ))}
                      {invoice.annualFee > 0 && (
                        <div className="flex justify-between py-2 text-sm">
                          <span>Anuidade</span>
                          <span>{formatCurrency(invoice.annualFee)}</span>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            </>
          )}
        </>
      )}
      <Dialog
        open={dialog === "refund"}
        onOpenChange={(open) => {
          if (!open && !busy) setDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estornar compra?</DialogTitle>
            <DialogDescription>
              As parcelas pendentes serão canceladas. Valores de parcelas já
              pagas serão devolvidos ao saldo com uma receita de estorno. O
              histórico será preservado.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => setDialog(null)}
          >
            Cancelar
          </Button>
          <Button disabled={busy} onClick={() => void confirmRefund()}>
            {busy ? "Estornando..." : "Confirmar estorno"}
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={dialog === "remove"}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setDialog(null);
            setCardToRemove(null);
          }
        }}
      >
        <DialogContent className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Remover {cardToRemove?.name}?</DialogTitle>
            <DialogDescription>
              O cartão será arquivado e não poderá receber novas compras. Seu
              histórico e as faturas pendentes continuarão disponíveis para
              consulta e pagamento.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                setDialog(null);
                setCardToRemove(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={busy}
              onClick={() => void confirmRemoval()}
            >
              {busy ? "Removendo..." : "Remover cartão"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={dialog === "card"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Novo cartão</DialogTitle>
            <DialogDescription>
              Informe o limite e os dias do ciclo. A anuidade é cobrada uma vez
              por ano na fatura.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCard} className="grid gap-4">
            <label className={field}>
              Nome
              <Input
                required
                maxLength={80}
                value={cardForm.name}
                onChange={(e) =>
                  setCardForm({ ...cardForm, name: e.target.value })
                }
              />
            </label>
            <label className={field}>
              Limite (R$)
              <Input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={cardForm.limit || ""}
                onChange={(e) =>
                  setCardForm({ ...cardForm, limit: number(e.target.value) })
                }
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={field}>
                Dia de fechamento
                <Input
                  required
                  type="number"
                  min="1"
                  max="31"
                  value={cardForm.closingDay}
                  onChange={(e) =>
                    setCardForm({
                      ...cardForm,
                      closingDay: number(e.target.value),
                    })
                  }
                />
              </label>
              <label className={field}>
                Dia do vencimento
                <Input
                  required
                  type="number"
                  min="1"
                  max="31"
                  value={cardForm.dueDay}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, dueDay: number(e.target.value) })
                  }
                />
              </label>
            </div>
            <label className={field}>
              Anuidade (R$, opcional)
              <Input
                type="number"
                min="0"
                step="0.01"
                value={cardForm.annualFee || ""}
                onChange={(e) =>
                  setCardForm({
                    ...cardForm,
                    annualFee: number(e.target.value),
                  })
                }
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <Button disabled={busy}>Salvar cartão</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={dialog === "purchase"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Compra no crédito</DialogTitle>
            <DialogDescription>
              Cada parcela compromete o limite da sua fatura. A soma das compras
              e parcelas de cada mês deve caber no limite do cartão.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitPurchase} className="grid gap-4">
            <label className={field}>
              Descrição
              <Input
                required
                maxLength={120}
                value={purchase.description}
                onChange={(e) =>
                  setPurchase({ ...purchase, description: e.target.value })
                }
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={field}>
                Valor total (R$)
                <Input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={purchase.amount || ""}
                  onChange={(e) =>
                    setPurchase({ ...purchase, amount: number(e.target.value) })
                  }
                />
              </label>
              <label className={field}>
                Parcelas
                <Input
                  required
                  type="number"
                  min="1"
                  max="60"
                  value={purchase.installments}
                  onChange={(e) =>
                    setPurchase({
                      ...purchase,
                      installments: number(e.target.value),
                    })
                  }
                />
              </label>
            </div>
            {/* Arredondamos para cima para incluir a maior parcela do rateio. */}
            <p className="text-sm text-slate-500">
              Até{" "}
              {formatCurrency(
                Math.ceil(
                  (purchase.amount * 100) / Math.max(1, purchase.installments),
                ) / 100,
              )}{" "}
              por parcela · limite por fatura{" "}
              {formatCurrency(selected?.limit ?? 0)}
            </p>
            <label className={field}>
              Data da compra
              <Input
                required
                type="date"
                max={currentDay()}
                value={purchase.date}
                onChange={(e) =>
                  setPurchase({ ...purchase, date: e.target.value })
                }
              />
            </label>
            <div className={field}>
              Categoria
              <CategorySelect
                type="EXPENSE"
                value={purchase.category}
                onChange={(category) => setPurchase({ ...purchase, category })}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <Button disabled={busy}>Registrar compra</Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
