import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  ComparativeBlock,
  MonthlyComparisonResponse,
} from "@/models/dashboard.model";
import {
  formatCurrency,
  formatMonthLabel,
  formatPercentage,
} from "@/utils/formatters";
import BlockMessage from "../block-message";

interface PeriodHighlightsProps {
  comparison: ComparativeBlock<MonthlyComparisonResponse>;
}

function balanceDescription(balance: number) {
  if (balance > 0) return `${formatCurrency(balance)} positivo`;
  if (balance < 0) return `${formatCurrency(Math.abs(balance))} negativo`;
  return `${formatCurrency(0)} de saldo`;
}

export default function PeriodHighlights({
  comparison,
}: PeriodHighlightsProps) {
  const bestMonth = comparison.data?.bestMonth;
  const worstMonth = comparison.data?.worstMonth;

  if (comparison.error) {
    return (
      <BlockMessage
        title="Destaques do período"
        message={comparison.error}
        tone="error"
      />
    );
  }

  if (!bestMonth && !worstMonth) {
    return (
      <BlockMessage
        title="Destaques do período"
        message="Ainda não há meses suficientes para apontar o melhor e o pior resultado."
      />
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-xl text-[#1F2937] dark:text-white">
          Destaques do período
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bestMonth ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Melhor mês
            </p>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">
              {formatMonthLabel(bestMonth.month)} — {balanceDescription(bestMonth.balance)}
            </p>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              {formatPercentage(bestMonth.economyRate)} de economia
            </p>
          </div>
        ) : null}

        {worstMonth ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pior mês
            </p>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">
              {formatMonthLabel(worstMonth.month)} — {balanceDescription(worstMonth.balance)}
            </p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {formatPercentage(worstMonth.economyRate)} de economia
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
