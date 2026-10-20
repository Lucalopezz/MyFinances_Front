import Link from "next/link";
import { ReceiptText } from "lucide-react";
import type { CardInvoice } from "@/models/card.model";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { currentDay } from "@/components/calendar/calendar-utils";
import {
  formatCurrency,
  formatMonthLabel,
  formatShortDate,
} from "@/utils/formatters";

/** Prioriza pendências próximas e mantém itens e comprovantes sob demanda. */
export function CardInvoices({
  invoices,
  busy,
  onPay,
}: {
  invoices: CardInvoice[];
  busy: boolean;
  onPay: (cycle: string) => void;
}) {
  // Faturas a pagar vêm primeiro, do vencimento mais antigo ao mais distante.
  // O histórico pago fica depois, com os pagamentos mais recentes no topo.
  const ordered = [...invoices].sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1;
    return a.paid
      ? b.cycle.localeCompare(a.cycle)
      : a.cycle.localeCompare(b.cycle);
  });

  return (
    <section aria-labelledby="card-invoices-title" className="space-y-3">
      <h2
        id="card-invoices-title"
        className="flex items-center gap-2 text-xl font-semibold"
      >
        <ReceiptText aria-hidden="true" className="size-5" />
        Faturas
      </h2>
      {ordered.length === 0 && (
        <p className="rounded-xl border p-5 text-sm text-slate-500 dark:text-slate-400">
          Ainda não há faturas para este cartão.
        </p>
      )}
      {ordered.map((invoice) => (
        <article
          key={invoice.cycle}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">
                  {formatMonthLabel(invoice.cycle)}
                </h3>
                <StatusBadge
                  tone={
                    invoice.paid
                      ? "green"
                      : invoice.status === "OVERDUE"
                        ? "red"
                        : "yellow"
                  }
                >
                  {invoice.paid
                    ? "Paga"
                    : invoice.status === "OVERDUE"
                      ? "Vencida"
                      : "Pendente"}
                </StatusBadge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Fecha em {formatShortDate(invoice.closingDate)} · vence em{" "}
                {formatShortDate(invoice.dueDate)}
              </p>
              {invoice.paid && invoice.paymentDate && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Paga em {formatShortDate(invoice.paymentDate)}
                </p>
              )}
            </div>
            <div className="space-y-2 text-right">
              <p className="whitespace-nowrap text-lg font-bold tabular-nums">
                {formatCurrency(invoice.total)}
              </p>
              {!invoice.paid && invoice.closingDate <= currentDay() && (
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => onPay(invoice.cycle)}
                >
                  Marcar como paga
                </Button>
              )}
            </div>
          </div>
          <details className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
            <summary className="cursor-pointer rounded-sm text-sm font-medium text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-blue-400">
              {invoice.paid && invoice.transactionIds?.length > 0
                ? "Ver itens e lançamentos"
                : "Ver itens da fatura"}
            </summary>
            <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
              {invoice.lines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-start justify-between gap-3 py-2 text-sm"
                >
                  <span className="min-w-0 break-words">
                    {line.description}{" "}
                    <span className="text-slate-500 dark:text-slate-400">
                      {line.number}/{line.installments}
                    </span>
                  </span>
                  <span className="shrink-0 whitespace-nowrap tabular-nums">
                    {formatCurrency(line.amount)}
                  </span>
                </div>
              ))}
              {invoice.annualFee > 0 && (
                <div className="flex justify-between gap-3 py-2 text-sm">
                  <span>Anuidade</span>
                  <span className="shrink-0 whitespace-nowrap tabular-nums">
                    {formatCurrency(invoice.annualFee)}
                  </span>
                </div>
              )}
            </div>
            {invoice.paid && invoice.transactionIds?.length > 0 && (
              <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                  Lançamentos do pagamento
                </p>
                {/* O recibo contém IDs na ordem do pagamento, sem vínculo por
                    item. Mantemos a lista para não associar um ID à compra errada. */}
                <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  {invoice.transactionIds.map((id, index) => (
                    <li key={id}>
                      <Link
                        href={`/transactions/${encodeURIComponent(id)}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Ver lançamento {index + 1}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </details>
        </article>
      ))}
    </section>
  );
}
