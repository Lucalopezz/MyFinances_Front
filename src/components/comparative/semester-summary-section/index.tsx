import SummaryCard from "@/components/summary-card";
import { CATEGORY_LABELS } from "@/constants/transaction-categories";
import type {
  ComparativeBlock,
  SemesterSummary,
} from "@/models/dashboard.model";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import {
  BadgePercent,
  PiggyBank,
  Tags,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import BlockMessage from "../block-message";

interface SemesterSummarySectionProps {
  summary: ComparativeBlock<SemesterSummary>;
  balancePercentageChange: number | null;
}

function categoryLabel(category?: string) {
  if (!category) return "Sem despesas";

  return (
    CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category
  );
}

export default function SemesterSummarySection({
  summary,
  balancePercentageChange,
}: SemesterSummarySectionProps) {
  const data = summary.data;
  const hasData = Boolean(
    data &&
      (data.totalIncomes !== 0 ||
        data.totalExpenses !== 0 ||
        data.balance !== 0),
  );

  if (summary.error) {
    return (
      <div className="mb-6">
        <BlockMessage
          title="Indicadores do semestre"
          message={summary.error}
          tone="error"
        />
      </div>
    );
  }

  if (!hasData || !data) {
    return (
      <div className="mb-6">
        <BlockMessage
          title="Indicadores do semestre"
          message="Nenhuma movimentação foi encontrada no semestre atual."
        />
      </div>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <SummaryCard
        title="Receitas no semestre"
        content={formatCurrency(data.totalIncomes)}
        layout="inline"
        icon={<TrendingUp className="h-7 w-7 text-green-600" />}
      />
      <SummaryCard
        title="Despesas no semestre"
        content={formatCurrency(data.totalExpenses)}
        layout="inline"
        icon={<TrendingDown className="h-7 w-7 text-red-600" />}
      />
      <SummaryCard
        title="Saldo acumulado"
        content={formatCurrency(data.balance)}
        layout="inline"
        valueClassName={data.balance >= 0 ? "text-green-600" : "text-red-600"}
        icon={<WalletCards className="h-7 w-7 text-blue-600" />}
      />
      <SummaryCard
        title="Taxa de economia"
        content={formatPercentage(data.economyRate)}
        layout="inline"
        icon={<PiggyBank className="h-7 w-7 text-emerald-600" />}
      />
      <SummaryCard
        title="Maior categoria de gasto"
        content={categoryLabel(data.highestSpendingCategory?.category)}
        subtitle={
          data.highestSpendingCategory
            ? formatCurrency(data.highestSpendingCategory.total)
            : undefined
        }
        layout="inline"
        icon={<Tags className="h-7 w-7 text-amber-600" />}
      />
      <SummaryCard
        title="Variação do saldo"
        content={
          balancePercentageChange === null
            ? "Não disponível"
            : formatPercentage(balancePercentageChange)
        }
        subtitle="Em relação ao semestre anterior"
        layout="inline"
        icon={<BadgePercent className="h-7 w-7 text-violet-600" />}
      />
    </div>
  );
}
