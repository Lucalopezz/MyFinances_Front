"use client";
import Link from "next/link";
import { ArrowUpRight, Info, TrendingUp, TriangleAlert } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { DailyProjection } from "@/models/calendar.model";
import { formatCurrency } from "@/utils/formatters";
import { shortDate } from "./calendar-utils";
export function ProjectionCard({
  projection,
  compact = false,
}: {
  projection: DailyProjection;
  compact?: boolean;
}) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      aria-labelledby="daily-projection-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <TrendingUp className="size-4" /> Olhando para frente
          </p>
          <h2 id="daily-projection-title" className="text-lg font-semibold">
            Seu saldo, dia a dia
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            De {shortDate(projection.start)} a {shortDate(projection.end)}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Saldo projetado no fim do mês
          </p>
          <p
            className={`mt-1 text-2xl font-semibold tracking-tight ${projection.projectedBalance < 0 ? "text-rose-600 dark:text-rose-400" : "text-blue-700 dark:text-blue-300"}`}
          >
            {formatCurrency(projection.projectedBalance)}
          </p>
        </div>
      </div>
      {projection.firstNegativeDate && (
        <p
          role="status"
          className="mx-5 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
        >
          <TriangleAlert className="size-4 shrink-0" />
          Atenção: o saldo fica negativo em{" "}
          {shortDate(projection.firstNegativeDate)}.
        </p>
      )}
      <div
        className="h-48 w-full px-2 pt-4 sm:h-56"
        role="img"
        aria-label={`Projeção diária. Saldo inicial ${formatCurrency(projection.baseBalance)}; saldo final ${formatCurrency(projection.projectedBalance)}. ${projection.firstNegativeDate ? `Primeiro dia negativo: ${shortDate(projection.firstNegativeDate)}.` : "Nenhum dia com saldo negativo."}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={projection.days}
            margin={{ top: 10, right: 18, bottom: 0, left: 5 }}
          >
            <defs>
              <linearGradient
                id="calendarBalanceFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(value) => String(value).slice(8)}
              axisLine={false}
              tickLine={false}
              minTickGap={25}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              width={62}
              tickFormatter={(value) =>
                new Intl.NumberFormat("pt-BR", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(Number(value))
              }
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <Tooltip
              labelFormatter={(value) => shortDate(String(value))}
              formatter={(value) => [
                formatCurrency(Number(value)),
                "Saldo projetado",
              ]}
              contentStyle={{
                borderRadius: 12,
                background: "#0f172a",
                color: "#f8fafc",
                border: 0,
              }}
            />
            <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="4 4" />
            <Area
              type="stepAfter"
              dataKey="balance"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#calendarBalanceFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="border-t border-slate-100 p-5 text-sm dark:border-slate-800">
        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            Saldo-base de{" "}
            <strong className="font-medium text-slate-900 dark:text-slate-200">
              {formatCurrency(projection.baseBalance)}
            </strong>
            : transações registradas antes de {shortDate(projection.start)}. É o
            saldo registrado no aplicativo, não o saldo disponível no banco.
          </p>
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer font-medium text-blue-700 dark:text-blue-300">
            {compact ? "Como calculamos" : "Premissas e valores por dia"}
          </summary>
          <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
            Somamos receitas previstas e movimentações realizadas e subtraímos
            despesas previstas. Pendências anteriores ao início entram uma única
            vez no primeiro dia (impacto:{" "}
            {formatCurrency(projection.overdueImpact)}). Previsões confirmadas
            são substituídas pelas transações reais. Compromissos não
            cadastrados não entram no cálculo. Os filtros da agenda não alteram
            esta projeção.
          </p>
          {!compact && (
            <div className="mt-4 max-h-64 overflow-auto">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">
                  Valores diários da projeção, em reais
                </caption>
                <thead className="sticky top-0 bg-white dark:bg-slate-900">
                  <tr>
                    {[
                      "Dia",
                      "Entradas previstas",
                      "Saídas previstas",
                      "Realizado líquido",
                      "Saldo",
                    ].map((h) => (
                      <th key={h} className="px-2 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projection.days.map((d) => (
                    <tr
                      key={d.date}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="whitespace-nowrap px-2 py-2">
                        {shortDate(d.date)}
                      </td>
                      {[d.income, d.expense, d.realized].map((v, i) => (
                        <td key={i} className="whitespace-nowrap px-2 py-2">
                          {formatCurrency(v)}
                        </td>
                      ))}
                      <td
                        className={`whitespace-nowrap px-2 py-2 font-semibold ${d.balance < 0 ? "text-rose-600 dark:text-rose-400" : ""}`}
                      >
                        {formatCurrency(d.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </details>
        {compact && (
          <Link
            href="/calendar"
            className="mt-4 inline-flex items-center gap-1 font-medium text-blue-700 dark:text-blue-300"
          >
            Abrir calendário financeiro
            <ArrowUpRight className="size-4" />
          </Link>
        )}
      </div>
    </section>
  );
}
