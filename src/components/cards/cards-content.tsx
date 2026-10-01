"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard as CreditCardIcon, Plus, ReceiptText } from "lucide-react";
import toast from "react-hot-toast";
import {
  createCard,
  createCardPurchase,
  payCardInvoice,
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
export function CardsContent({ initialCards }: { initialCards: CreditCard[] }) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [selectedId, setSelectedId] = useState(initialCards[0]?.id ?? "");
  const [dialog, setDialog] = useState<"card" | "purchase" | null>(null);
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
              </Button>
            ))}
          </div>
          {selected && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Limite total", selected.limit],
                  ["Em uso", selected.used],
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
                <Button
                  onClick={() => {
                    setError("");
                    setDialog("purchase");
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  Compra no crédito
                </Button>
              </div>
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
              O valor total compromete o limite agora. As parcelas entram nas
              próximas faturas.
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
