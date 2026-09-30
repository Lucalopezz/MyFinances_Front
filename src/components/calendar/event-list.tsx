"use client";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarCheck2,
  Check,
} from "lucide-react";
import type { CalendarEvent } from "@/models/calendar.model";
import { useCategories } from "@/providers/category-provider";
import { formatCurrency } from "@/utils/formatters";
import { shortDate } from "./calendar-utils";
import { Button } from "@/components/ui/button";
export function EventList({
  events,
  onReceive,
  empty = "Nenhum compromisso neste dia.",
}: {
  events: CalendarEvent[];
  onReceive: (event: CalendarEvent) => void;
  empty?: string;
}) {
  const { categoryLabel } = useCategories();
  if (!events.length)
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-10 text-center text-slate-500 dark:text-slate-400">
        <CalendarCheck2 className="size-9 text-slate-300 dark:text-slate-600" />
        <p className="text-sm">{empty}</p>
        <p className="max-w-xs text-xs">
          Cadastre receitas recorrentes ou despesas fixas para acompanhar os
          próximos dias.
        </p>
      </div>
    );
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {events.map((event) => {
        const income = event.type === "INCOME";
        const settled = event.status === "SETTLED";
        return (
          <li key={event.id} className="flex items-start gap-3 py-4">
            <span
              className={`mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl ${income ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400"}`}
            >
              {income ? (
                <ArrowDownLeft className="size-4" />
              ) : (
                <ArrowUpRight className="size-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                <p className="break-words font-medium">{event.description}</p>
                <p
                  className={`whitespace-nowrap text-sm font-semibold tabular-nums ${income ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100"}`}
                >
                  {income ? "+" : "−"}{" "}
                  {formatCurrency(event.actualAmount ?? event.amount)}
                </p>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {categoryLabel(event.category)} · {shortDate(event.dueDate)}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${settled ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" : event.status === "OVERDUE" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"}`}
                >
                  {settled && <Check className="size-3" />}
                  {settled
                    ? income
                      ? "Recebido"
                      : "Pago"
                    : event.status === "OVERDUE"
                      ? "Vencido"
                      : "Previsto"}
                  {settled && event.actualDate
                    ? ` em ${shortDate(event.actualDate)}`
                    : ""}
                </span>
                {!settled &&
                  (income ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReceive(event)}
                    >
                      Confirmar recebimento
                    </Button>
                  ) : (
                    <Link
                      href="/fixed-expenses"
                      className="py-2 text-xs font-medium text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
                    >
                      Gerenciar pagamento →
                    </Link>
                  ))}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
