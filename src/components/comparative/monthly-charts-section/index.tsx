import type {
  ComparativeBlock,
  MonthlyComparisonResponse,
} from "@/models/dashboard.model";
import { formatMonthLabel } from "@/utils/formatters";
import BlockMessage from "../block-message";
import SemesterComparisonChart from "../semestral-comparison-chart";
import TrendLineChart from "../trend-line-chart";

interface MonthlyChartsSectionProps {
  comparison: ComparativeBlock<MonthlyComparisonResponse>;
}

export default function MonthlyChartsSection({
  comparison,
}: MonthlyChartsSectionProps) {
  const months = comparison.data?.months ?? [];
  const hasData = months.some(
    (month) => month.totalIncomes !== 0 || month.totalExpenses !== 0,
  );
  const chartData = months.map((month) => ({
    name: formatMonthLabel(month.month),
    Receitas: month.totalIncomes,
    Despesas: month.totalExpenses,
  }));
  const trendData = months.map((month) => ({
    name: formatMonthLabel(month.month),
    Receitas: month.totalIncomes,
    Despesas: month.totalExpenses,
    Saldo: month.balance ?? month.totalIncomes - month.totalExpenses,
  }));

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {comparison.error ? (
        <BlockMessage
          title="Comparativo semestral"
          message={comparison.error}
          tone="error"
        />
      ) : !hasData ? (
        <BlockMessage
          title="Comparativo semestral"
          message="Não há dados mensais para montar o comparativo."
        />
      ) : (
        <SemesterComparisonChart data={chartData} isLoading={false} />
      )}

      {comparison.error ? (
        <BlockMessage
          title="Tendências semestrais"
          message={comparison.error}
          tone="error"
        />
      ) : !hasData ? (
        <BlockMessage
          title="Tendências semestrais"
          message="Não há dados mensais para identificar tendências."
        />
      ) : (
        <TrendLineChart data={trendData} isLoading={false} />
      )}
    </div>
  );
}
