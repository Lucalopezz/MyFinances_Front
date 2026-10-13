import Link from "next/link";
import type { CreditCard } from "@/models/card.model";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { formatCurrency, formatShortDate } from "@/utils/formatters";

/** Consulta compras e estornos em uma visão própria, preservando o histórico. */
export function CardPurchaseHistory({
  purchases,
  busy,
  onRefund,
}: {
  purchases: CreditCard["purchases"];
  busy: boolean;
  onRefund: (purchaseId: string) => void;
}) {
  return (
    <section aria-labelledby="card-purchases-title" className="space-y-3">
      <h2 id="card-purchases-title" className="text-xl font-semibold">
        Compras e estornos
      </h2>
      {purchases.length === 0 && (
        <p className="rounded-xl border p-5 text-sm text-slate-500 dark:text-slate-400">
          Ainda não há compras para este cartão.
        </p>
      )}
      {purchases.map((item) => (
        <article
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="min-w-0 space-y-1">
            <p className="break-words font-medium">{item.description}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {formatCurrency(item.amount)} · {item.installments} parcela(s) ·{" "}
              {formatShortDate(item.date)}
            </p>
            {item.refundedAt && (
              <StatusBadge tone="blue">
                Estornada em {formatShortDate(item.refundedAt)}
              </StatusBadge>
            )}
            {item.fixedExpenseId && (
              <Link
                href="/fixed-expenses"
                className="block text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                Ver despesa fixa e renovação
              </Link>
            )}
          </div>
          {!item.refundedAt && (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => onRefund(item.id)}
            >
              Estornar compra
            </Button>
          )}
        </article>
      ))}
    </section>
  );
}
