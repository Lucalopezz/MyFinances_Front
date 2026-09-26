import type { DashboardForecast } from "@/models/dashboard.model";
import { formatCurrency, formatMonthLabel, formatShortDate } from "@/utils/formatters";

export function ForecastCard({ forecast }: { forecast: DashboardForecast }) {
  return (
    <section className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/40" aria-labelledby="forecast-title">
      <div className="mb-4">
        <h2 id="forecast-title" className="text-lg font-semibold">Projeção do mês</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Previsão para {formatMonthLabel(forecast.month)} com despesas fixas ainda não pagas. Nenhuma transação prevista é criada.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><p className="text-sm text-gray-600 dark:text-gray-400">Saldo atual</p><p className="text-xl font-semibold">{formatCurrency(forecast.currentBalance)}</p></div>
        <div><p className="text-sm text-gray-600 dark:text-gray-400">Despesas pendentes</p><p className="text-xl font-semibold text-red-600 dark:text-red-400">{formatCurrency(forecast.pendingFixedExpenses)}</p></div>
        <div><p className="text-sm text-gray-600 dark:text-gray-400">Saldo estimado</p><p className="text-xl font-semibold">{formatCurrency(forecast.projectedBalance)}</p></div>
      </div>
      <div className="mt-4 border-t border-blue-100 pt-4 dark:border-blue-900">
        <h3 className="mb-2 text-sm font-semibold">Despesas incluídas</h3>
        {forecast.expenses.length ? (
          <ul className="space-y-2 text-sm">
            {forecast.expenses.map((expense) => (
              <li key={expense.id} className="flex flex-wrap justify-between gap-2">
                <span>{expense.name} · vence em {formatShortDate(expense.dueDate)}</span>
                <span className="font-medium">{formatCurrency(expense.amount)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">Nenhuma despesa fixa pendente. A projeção é igual ao saldo atual.</p>
        )}
      </div>
    </section>
  );
}
