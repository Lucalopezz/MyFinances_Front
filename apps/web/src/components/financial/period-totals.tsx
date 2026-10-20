import { formatCurrency } from "@/utils/formatters";

interface PeriodTotalsProps {
  balance: number;
  income: number;
  expense: number;
  filtered?: boolean;
}

export function PeriodTotals({
  balance,
  income,
  expense,
  filtered = false,
}: PeriodTotalsProps) {
  const metrics = [
    {
      label: filtered ? "Resultado filtrado" : "Resultado do mês",
      value: balance,
      color:
        balance < 0
          ? "text-red-600 dark:text-red-400"
          : "text-emerald-700 dark:text-emerald-400",
    },
    {
      label: filtered ? "Entradas filtradas" : "Entradas do mês",
      value: income,
      color: "text-blue-700 dark:text-blue-400",
    },
    {
      label: filtered ? "Saídas filtradas" : "Saídas do mês",
      value: expense,
      color: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-3 sm:p-6">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={`min-w-0 ${index === 0 ? "col-span-2 sm:col-span-1" : ""}`}
        >
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {metric.label}
          </dt>
          <dd
            className={`mt-1 break-words text-xl font-semibold tracking-tight sm:text-2xl ${metric.color}`}
          >
            {formatCurrency(metric.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
