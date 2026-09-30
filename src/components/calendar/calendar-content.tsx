"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Clock3,
  Repeat2,
  Pencil,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  getFinancialCalendar,
  getRecurringIncomes,
  pauseRecurringIncome,
} from "@/actions/calendar/calendar";
import type {
  FinancialCalendar,
  CalendarEvent,
  RecurringIncome,
} from "@/models/calendar.model";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { IncomeDialog, ReceiptDialog } from "./income-dialog";
import { EventList } from "./event-list";
import { MonthGrid } from "./month-grid";
import { ProjectionCard } from "./projection-card";
import {
  monthLabel,
  shiftMonth,
  shortDate,
  currentDay,
} from "./calendar-utils";
import { CalendarLoading } from "./calendar-loading";
export function CalendarContent({
  initialMonth,
  initialData,
  initialIncomes,
}: {
  initialMonth: string;
  initialData?: FinancialCalendar;
  initialIncomes?: RecurringIncome[];
}) {
  const [month, setMonth] = useState(initialMonth);
  const [selected, setSelected] = useState(initialData?.today ?? currentDay());
  const [view, setView] = useState<"calendar" | "agenda">("calendar");
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [status, setStatus] = useState("ALL");
  const [editor, setEditor] = useState<RecurringIncome | "new" | null>(null);
  const [receipt, setReceipt] = useState<CalendarEvent | null>(null);
  const [pausing, setPausing] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["calendar", month],
    queryFn: () => getFinancialCalendar(month),
    initialData: month === initialMonth ? initialData : undefined,
    staleTime: 0,
    retry: false,
  });
  const incomes = useQuery({
    queryKey: ["recurring-incomes"],
    queryFn: getRecurringIncomes,
    initialData: initialIncomes,
    retry: false,
  });
  async function refresh() {
    await Promise.all(
      [
        "calendar",
        "recurring-incomes",
        "transactions",
        "dashboard",
        "wishlist",
        "budgets",
        "fixed-expenses",
      ].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
    );
  }
  function navigate(next: string) {
    setMonth(next);
    setSelected(
      next === initialMonth
        ? (initialData?.today ?? currentDay())
        : `${next}-01`,
    );
  }
  async function toggle(income: RecurringIncome) {
    setPausing(income.id);
    try {
      await pauseRecurringIncome(income.id, !income.paused, income.revision);
      await refresh();
      toast.success(
        income.paused
          ? "Recorrência retomada a partir de amanhã."
          : "Recorrência pausada a partir de amanhã.",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível alterar.");
      await incomes.refetch();
    } finally {
      setPausing(null);
    }
  }
  const data = query.data;
  const matches = (e: CalendarEvent) =>
    (filter === "ALL" || e.type === filter) &&
    (status === "ALL" || e.status === status);
  const events = data?.events.filter(matches) ?? [];
  const overdue = data?.overdue.filter(matches) ?? [];
  const dates = Array.from(new Set(events.map((e) => e.dueDate)));
  const pendingIncome =
    data?.events
      .filter((e) => e.type === "INCOME" && e.status !== "SETTLED")
      .reduce((n, e) => n + e.amount, 0) ?? 0;
  const pendingExpense =
    data?.events
      .filter((e) => e.type === "EXPENSE" && e.status !== "SETTLED")
      .reduce((n, e) => n + e.amount, 0) ?? 0;
  return (
    <div className="mx-auto max-w-[1440px] space-y-6 text-slate-900 dark:text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Planeje com clareza
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Calendário financeiro
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Saiba o que entra, o que vence e como seu saldo pode evoluir.
          </p>
        </div>
        <Button
          className="h-11 gap-2 rounded-xl"
          onClick={() => setEditor("new")}
        >
          <Plus className="size-4" />
          Nova receita recorrente
        </Button>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mês anterior"
            disabled={month <= shiftMonth(initialMonth, -12)}
            onClick={() => navigate(shiftMonth(month, -1))}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <h2
            className="min-w-36 text-center text-sm font-semibold capitalize sm:min-w-44 sm:text-base"
            aria-live="polite"
          >
            {monthLabel(month)}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Próximo mês"
            disabled={month >= shiftMonth(initialMonth, 12)}
            onClick={() => navigate(shiftMonth(month, 1))}
          >
            <ChevronRight className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(initialMonth)}
          >
            Hoje
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-slate-400 sm:block">
            Horário de Brasília
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Atualizar calendário"
            disabled={query.isFetching}
            onClick={() => void refresh()}
          >
            <RefreshCw
              className={cn("size-4", query.isFetching && "animate-spin")}
            />
          </Button>
        </div>
      </div>
      {query.isError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
        >
          <p>
            {query.error.message || "Não foi possível carregar o calendário."}
          </p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => void query.refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      )}
      {query.isPending && <CalendarLoading />}
      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "A receber neste mês",
                value: formatCurrency(pendingIncome),
                icon: ArrowDownLeft,
                color: "text-emerald-700 dark:text-emerald-400",
                subtitle: "Receitas ainda não confirmadas",
              },
              {
                title: "A pagar neste mês",
                value: formatCurrency(pendingExpense),
                icon: ArrowUpRight,
                color: "text-orange-700 dark:text-orange-400",
                subtitle: "Despesas fixas ainda pendentes",
              },
              {
                title: "Pendências anteriores",
                value: String(data.overdue.length).padStart(2, "0"),
                icon: Clock3,
                color: data.overdue.length
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-500",
                subtitle: `Antes de ${shortDate(data.projection.start)}`,
              },
            ].map((card) => (
              <div
                key={card.title}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {card.title}
                  </p>
                  <p
                    className={`mt-2 text-2xl font-semibold tracking-tight ${card.color}`}
                  >
                    {card.value}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {card.subtitle}
                  </p>
                </div>
                <card.icon className={`size-5 shrink-0 ${card.color}`} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
              aria-label="Tipo de compromisso"
            >
              {(
                [
                  { value: "ALL", label: "Todos" },
                  { value: "INCOME", label: "Receitas" },
                  { value: "EXPENSE", label: "Despesas" },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  aria-pressed={filter === item.value}
                  onClick={() => setFilter(item.value)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-600",
                    filter === item.value
                      ? "bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-blue-300"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                aria-label="Filtrar por situação"
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-900"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ALL">Todas as situações</option>
                <option value="PENDING">Previstos</option>
                <option value="OVERDUE">Vencidos</option>
                <option value="SETTLED">Pagos e recebidos</option>
              </select>
              <div className="hidden rounded-lg border border-slate-200 p-1 md:flex dark:border-slate-700">
                <Button
                  size="sm"
                  variant={view === "calendar" ? "secondary" : "ghost"}
                  aria-pressed={view === "calendar"}
                  onClick={() => setView("calendar")}
                >
                  <CalendarDays className="mr-2 size-4" />
                  Mês
                </Button>
                <Button
                  size="sm"
                  variant={view === "agenda" ? "secondary" : "ghost"}
                  aria-pressed={view === "agenda"}
                  onClick={() => setView("agenda")}
                >
                  <List className="mr-2 size-4" />
                  Agenda
                </Button>
              </div>
            </div>
          </div>
          {overdue.length > 0 && (
            <details className="rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-3 dark:border-rose-900/50 dark:bg-rose-950/10">
              <summary className="cursor-pointer text-sm font-medium text-rose-700 dark:text-rose-300">
                {overdue.length}{" "}
                {overdue.length === 1
                  ? "pendência anterior"
                  : "pendências anteriores"}{" "}
                · ver e resolver
              </summary>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Estas previsões entram uma única vez no início da projeção.
              </p>
              <EventList events={overdue} onReceive={setReceipt} />
            </details>
          )}
          <div
            className={cn(
              "gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]",
              view === "calendar" ? "hidden md:grid" : "hidden",
            )}
          >
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <MonthGrid
                month={month}
                today={data.today}
                selected={selected}
                events={events}
                projection={data.projection}
                onSelect={setSelected}
              />
              <div className="flex flex-wrap gap-4 bg-white px-4 py-3 text-[11px] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <span>+ Receita</span>
                <span>− Despesa</span>
                <span>✓ Realizado</span>
                <span className="text-rose-600 dark:text-rose-400">
                  ● Saldo negativo
                </span>
              </div>
            </section>
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white px-5 py-5 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                Agenda do dia
              </p>
              <h3 className="mt-2 text-lg font-semibold">
                {shortDate(selected)}
                {selected === data.today ? " · Hoje" : ""}
              </h3>
              <EventList
                events={events.filter((e) => e.dueDate === selected)}
                onReceive={setReceipt}
              />
            </section>
          </div>
          <section
            className={cn(
              "rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-900",
              view === "calendar" && "md:hidden",
            )}
          >
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <List className="size-4 text-blue-500" />
              Agenda do mês
            </h3>
            {dates.length ? (
              dates.map((date) => (
                <section key={date} className="mb-5 last:mb-0">
                  <h4 className="sticky top-0 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold dark:bg-slate-800">
                    {shortDate(date)}
                    {date === data.today ? " · Hoje" : ""}
                  </h4>
                  <EventList
                    events={events.filter((e) => e.dueDate === date)}
                    onReceive={setReceipt}
                  />
                </section>
              ))
            ) : (
              <EventList
                events={[]}
                onReceive={setReceipt}
                empty="Nenhum compromisso para os filtros deste mês."
              />
            )}
          </section>
          <ProjectionCard projection={data.projection} />
        </>
      )}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <Repeat2 className="size-4 text-blue-500" />
              Suas receitas recorrentes
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Edite ou pause as próximas previsões. Alterações valem a partir de
              amanhã.
            </p>
          </div>
          <Link
            href="/fixed-expenses"
            className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-300"
          >
            Gerenciar despesas fixas →
          </Link>
        </div>
        {incomes.isPending && (
          <p role="status" className="text-sm text-slate-500">
            Carregando recorrências…
          </p>
        )}
        {incomes.isError && (
          <p role="alert" className="text-sm text-rose-600">
            Não foi possível carregar as receitas.{" "}
            <button
              className="underline"
              onClick={() => void incomes.refetch()}
            >
              Tentar novamente
            </button>
          </p>
        )}
        {incomes.data?.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
            <p className="font-medium">Dê um lugar às próximas entradas</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Salário, aluguel ou outra renda regular: cadastre uma vez para
              planejar os próximos meses.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setEditor("new")}
            >
              <Plus className="mr-2 size-4" />
              Cadastrar primeira receita
            </Button>
          </div>
        )}
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {incomes.data?.map((income) => (
            <li
              key={income.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <p className="break-words text-sm font-medium">
                  {income.description}
                  <span
                    className={cn(
                      "ml-2 inline-block rounded-full px-2 py-0.5 text-[10px]",
                      income.paused
                        ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
                    )}
                  >
                    {income.paused ? "Pausada" : "Ativa"}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {formatCurrency(income.amount)} ·{" "}
                  {income.recurrence === "MONTHLY"
                    ? `Todo mês, dia ${Number(income.startDate.slice(8))}`
                    : `Todo ano, ${shortDate(income.startDate)}`}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditor(income)}
                  aria-label={`Editar ${income.description}`}
                >
                  <Pencil className="mr-2 size-3.5" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pausing !== null}
                  onClick={() => void toggle(income)}
                  aria-label={`${income.paused ? "Retomar" : "Pausar"} ${income.description}`}
                >
                  {income.paused ? (
                    <Play className="mr-2 size-3.5" />
                  ) : (
                    <Pause className="mr-2 size-3.5" />
                  )}
                  {income.paused ? "Retomar" : "Pausar"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      {editor && (
        <IncomeDialog
          income={editor === "new" ? undefined : editor}
          onClose={() => setEditor(null)}
          onSaved={refresh}
        />
      )}
      {receipt && (
        <ReceiptDialog
          event={receipt}
          onClose={() => setReceipt(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
