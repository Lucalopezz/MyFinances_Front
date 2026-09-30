"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { addWishMovement, completeWish } from "@/actions/wishlist/wishlist";
import { useDeleteWish } from "@/hooks/queries/useWishlist";
import type { WishListInterface } from "@/models/wishlist.model";
import { formatCurrency, formatShortDate } from "@/utils/formatters";
import { toDateInputValue } from "@/utils/date";
import { CategorySelect } from "@/components/category/category-select";
import { RowActions } from "@/components/common/row-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Operation = "DEPOSIT" | "WITHDRAWAL" | "COMPLETE";

export function WishList({ wishListItems, onChanged }: {
  wishListItems: WishListInterface[];
  onChanged: () => Promise<void>;
}) {
  const { deleteWish } = useDeleteWish();
  const [selected, setSelected] = useState<WishListInterface | null>(null);
  const [operation, setOperation] = useState<Operation>("DEPOSIT");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [completedId, setCompletedId] = useState<string | null>(null);

  function open(item: WishListInterface, kind: Operation) {
    setSelected(item);
    setOperation(kind);
    setValue(kind === "COMPLETE" ? item.desiredValue.toFixed(2) : "");
    setDate(toDateInputValue(new Date()));
    setNote(kind === "COMPLETE" ? item.name : "");
    setCategory("");
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || busy) return;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0 || Math.abs(parsed * 100 - Math.round(parsed * 100)) > 0.000001) {
      setError("Informe um valor positivo com até duas casas decimais.");
      return;
    }
    if (operation === "COMPLETE" && !category) {
      setError("Escolha uma categoria de despesa.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (operation === "COMPLETE") {
        const result = await completeWish(selected.id, { value: parsed, date, category, description: note.trim() || selected.name });
        setCompletedId(result.transaction.id);
        toast.success(result.alreadyCompleted
          ? "Compra já concluída."
          : `Compra concluída. Reserva usada: ${formatCurrency(result.coveredAmount ?? 0)}. Sobra liberada: ${formatCurrency(result.releasedAmount ?? 0)}. Diferença paga: ${formatCurrency(result.uncoveredAmount ?? 0)}.`);
      } else {
        await addWishMovement(selected.id, { kind: operation, value: parsed, date, note: note.trim() || undefined });
        toast.success(operation === "DEPOSIT" ? "Aporte registrado." : "Retirada registrada.");
      }
      setSelected(null);
      await onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    {completedId && <p role="status" className="mb-4 rounded border border-green-600 p-3">Compra registrada. <Link className="underline" href={`/transactions/${completedId}`}>Ver transação</Link></p>}
    {wishListItems.length === 0 && <p className="rounded border p-6 text-center text-muted-foreground">Nenhuma meta neste filtro.</p>}
    <div className="grid gap-4 lg:grid-cols-2">
      {wishListItems.map((item) => <article key={item.id} className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-lg font-semibold">{item.name}</h2><p className="text-sm text-muted-foreground">Valor desejado: {formatCurrency(item.desiredValue)}</p></div>
          {item.status === "ACTIVE" && <RowActions editHref={`/wishlist/edit/${item.id}`} deleteId={item.id} deleteAction={async (id) => { await deleteWish(id); await onChanged(); }} />}
        </div>
        {item.status === "ACTIVE" && <>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <p>Reservado<br /><strong>{formatCurrency(item.reservedAmount)}</strong></p>
            <p>Restante<br /><strong>{formatCurrency(item.remainingAmount)}</strong></p>
          </div>
          <div className="mt-3 h-2 rounded bg-muted" role="progressbar" aria-label={`Progresso de ${item.name}`} aria-valuenow={item.progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-2 rounded bg-green-600" style={{ width: `${item.progressPercent}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{item.progressPercent}% da meta · Prazo: {item.targetDate ? formatShortDate(item.targetDate) : "sem prazo"}</p>
        </>}
        {item.status === "ACTIVE" && <p className="mt-2 text-sm">{item.deadlineState === "OVERDUE" ? "Prazo vencido: revise a data da meta." : item.monthlySuggestion !== null ? `Sugestão: ${formatCurrency(item.monthlySuggestion)} por mês` : item.deadlineState === "REACHED" ? "Meta atingida. A compra continua opcional." : "Sem prazo: sem sugestão mensal."}</p>}
        {item.reservationMigrationState === "PENDING" && <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">Referência antiga: {formatCurrency(item.legacySavedAmount)}. Nenhum aporte foi criado automaticamente.</p>}
        {item.status === "COMPLETED" && <p className="mt-2 text-sm">Compra concluída em {formatShortDate(item.completedAt ?? undefined)} · <Link className="underline" href={`/transactions/${item.purchaseTransactionId}`}>Ver transação</Link></p>}
        {item.status === "ACTIVE" && <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => open(item, "DEPOSIT")}>Aportar</Button>
          <Button type="button" size="sm" variant="outline" disabled={item.reservedAmount <= 0} onClick={() => open(item, "WITHDRAWAL")}>Retirar</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => open(item, "COMPLETE")}>Concluir compra</Button>
        </div>}
        <details className="mt-4 text-sm"><summary className="cursor-pointer">Histórico de reservas ({item.movements.length})</summary>
          {item.movements.length === 0 ? <p className="mt-2 text-muted-foreground">Nenhum movimento registrado.</p> : <ul className="mt-2 space-y-2">{item.movements.map((movement) => <li key={movement.id} className="border-t pt-2">{formatShortDate(movement.date)} · {movement.kind === "DEPOSIT" ? "Aporte" : movement.kind === "WITHDRAWAL" ? "Retirada" : movement.kind === "CONSUMPTION" ? "Usado na compra" : "Sobra liberada"} · {formatCurrency(movement.value)}{movement.note ? ` · ${movement.note}` : ""}</li>)}</ul>}
        </details>
      </article>)}
    </div>
    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open && !busy) setSelected(null); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{operation === "DEPOSIT" ? "Aportar na meta" : operation === "WITHDRAWAL" ? "Retirar da meta" : "Concluir compra"}</DialogTitle>
          <DialogDescription>{operation === "COMPLETE" ? "A compra cria uma despesa. A reserva cobre até o valor pago e a sobra é liberada." : "A reserva usa dinheiro já registrado; não cria receita nem despesa."}</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1"><Label htmlFor="wish-value">{operation === "COMPLETE" ? "Valor pago" : "Valor"}</Label><Input id="wish-value" type="number" min="0.01" step="0.01" value={value} onChange={(event) => setValue(event.target.value)} required /></div>
          <div className="space-y-1"><Label htmlFor="wish-date">{operation === "COMPLETE" ? "Data da compra" : "Data do movimento"}</Label><Input id="wish-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></div>
          {operation === "COMPLETE" && <div className="space-y-1"><Label>Categoria de despesa</Label><CategorySelect type="EXPENSE" value={category} onChange={setCategory} /></div>}
          <div className="space-y-1"><Label htmlFor="wish-note">{operation === "COMPLETE" ? "Descrição" : "Observação (opcional)"}</Label><Input id="wish-note" maxLength={300} value={note} onChange={(event) => setNote(event.target.value)} required={operation === "COMPLETE"} /></div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => setSelected(null)}>Cancelar</Button><Button type="submit" disabled={busy}>{busy ? "Salvando..." : "Confirmar"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}
