"use client";
import { useRef, type KeyboardEvent } from "react";
import type { CalendarEvent, DailyProjection } from "@/models/calendar.model";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";
import { shortDate } from "./calendar-utils";
export function MonthGrid({
  month,
  today,
  selected,
  events,
  projection,
  onSelect,
}: {
  month: string;
  today: string;
  selected: string;
  events: CalendarEvent[];
  projection: DailyProjection;
  onSelect: (date: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [year, m] = month.split("-").map(Number);
  const offset = (new Date(Date.UTC(year, m - 1, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const days = Array.from(
    { length: Math.ceil((offset + count) / 7) * 7 },
    (_, i) => i - offset + 1,
  );
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, day: number) {
    const shifts: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    if (!(event.key in shifts)) return;
    event.preventDefault();
    const next = Math.min(count, Math.max(1, day + shifts[event.key]));
    ref.current
      ?.querySelector<HTMLButtonElement>(`[data-day="${next}"]`)
      ?.focus();
    onSelect(`${month}-${String(next).padStart(2, "0")}`);
  }
  return (
    <div ref={ref}>
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-medium text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800">
        {days.map((day, i) => {
          if (day < 1 || day > count)
            return (
              <div
                key={i}
                className="min-h-24 bg-slate-50/80 dark:bg-slate-900/50"
              />
            );
          const date = `${month}-${String(day).padStart(2, "0")}`;
          const entries = events.filter((e) => e.dueDate === date);
          const balance = projection.days.find((d) => d.date === date)?.balance;
          return (
            <button
              type="button"
              key={date}
              data-day={day}
              onKeyDown={(e) => keyboard(e, day)}
              onClick={() => onSelect(date)}
              aria-pressed={selected === date}
              aria-current={date === today ? "date" : undefined}
              aria-label={`${shortDate(date)}: ${entries.length} compromissos${balance !== undefined ? `, saldo projetado ${formatCurrency(balance)}` : ""}`}
              className={cn(
                "relative flex min-h-28 min-w-0 flex-col gap-2 bg-white p-2 text-left transition-colors hover:bg-blue-50 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-blue-600 dark:bg-slate-900 dark:hover:bg-slate-800 xl:min-h-32 xl:p-3",
                selected === date &&
                  "z-10 ring-2 ring-inset ring-blue-500 bg-blue-50/60 dark:bg-blue-950/30",
              )}
            >
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-medium",
                  date === today && "bg-blue-600 text-white",
                  date !== today && "text-slate-600 dark:text-slate-300",
                )}
              >
                {day}
              </span>
              <div className="w-full space-y-1">
                {entries.slice(0, 2).map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      "truncate rounded px-1.5 py-1 text-[10px] font-medium xl:text-xs",
                      e.status === "SETTLED"
                        ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        : e.type === "INCOME"
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300",
                    )}
                  >
                    {e.status === "SETTLED"
                      ? "✓ "
                      : e.type === "INCOME"
                        ? "+ "
                        : "− "}
                    {e.description}
                  </div>
                ))}
                {entries.length > 2 && (
                  <p className="px-1 text-[10px] text-slate-500">
                    +{entries.length - 2} mais
                  </p>
                )}
              </div>
              {balance !== undefined && balance < 0 && (
                <span className="mt-auto flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400">
                  <span className="size-1.5 rounded-full bg-rose-500" />
                  Saldo negativo
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
