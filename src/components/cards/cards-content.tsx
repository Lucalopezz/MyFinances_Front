"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard as CreditCardIcon, Plus, Trash2 } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/formatters";
import { currentDay } from "@/components/calendar/calendar-utils";
import { CardInvoices } from "./card-invoices";
import { CardPurchaseHistory } from "./card-purchase-history";

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
  const [view, setView] = useState<"invoices" | "purchases">("invoices");
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
    if (initialSelectedId) {
      setSelectedId(initialSelectedId);
      setView("invoices");
    }
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
      setView("invoices");
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
      setView("invoices");
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
          <nav
            className="flex flex-wrap gap-2"
            aria-label="Cartões cadastrados"
          >
            {cards.map((card) => (
              <Button
                key={card.id}
                type="button"
                variant={card.id === selected?.id ? "default" : "outline"}
                aria-pressed={card.id === selected?.id}
                onClick={() => {
                  setSelectedId(card.id);
                  setView("invoices");
                }}
              >
                {card.name}
                {card.archived ? " (arquivado)" : ""}
              </Button>
            ))}
          </nav>
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
              {/* Separar as visões mantém as faturas próximas das ações de
                  pagamento, sem repetir o histórico inteiro na mesma tela. */}
              <nav
                aria-label="Visualização do cartão"
                className="flex flex-wrap gap-2"
              >
                <Button
                  type="button"
                  variant={view === "invoices" ? "default" : "outline"}
                  aria-pressed={view === "invoices"}
                  onClick={() => setView("invoices")}
                >
                  Faturas
                </Button>
                <Button
                  type="button"
                  variant={view === "purchases" ? "default" : "outline"}
                  aria-pressed={view === "purchases"}
                  onClick={() => setView("purchases")}
                >
                  Compras e estornos
                </Button>
              </nav>
              {view === "invoices" ? (
                <CardInvoices
                  key={selected.id}
                  invoices={selected.invoices}
                  busy={busy}
                  onPay={(cycle) => void pay(cycle)}
                />
              ) : (
                <CardPurchaseHistory
                  purchases={selected.purchases}
                  busy={busy}
                  onRefund={(purchaseId) => {
                    setError("");
                    setPurchaseToRefund(purchaseId);
                    setDialog("refund");
                  }}
                />
              )}
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
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
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
          <DialogFooter>
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
          </DialogFooter>
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
          <DialogFooter>
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
          </DialogFooter>
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
