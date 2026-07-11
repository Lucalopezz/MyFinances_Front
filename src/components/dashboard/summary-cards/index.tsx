import SummaryCard from "@/components/summary-card";
import {
  formatCurrency,
  formatMonthLabel,
  formatPercentage,
} from "@/utils/formatters";
import { CATEGORY_LABELS } from "@/constants/transaction-categories";

interface SummaryCardsProps {
  balance: number;
  totalIncomes: number;
  totalExpenses: number;
  economyRate?: number;
  highestSpendingCategory?: {
    category: string;
    total: number;
  } | null;
  periodStart: string;
  isLoading: boolean;
}

const SummaryCards = ({
  balance,
  totalIncomes,
  totalExpenses,
  economyRate,
  highestSpendingCategory,
  periodStart,
  isLoading,
}: SummaryCardsProps) => {
  const monthLabel = formatMonthLabel(periodStart);
  const highestSpendingCategoryLabel = highestSpendingCategory?.category
    ? CATEGORY_LABELS[
        highestSpendingCategory.category as keyof typeof CATEGORY_LABELS
      ] ?? highestSpendingCategory.category
    : "Sem despesas no mês";
  const summaryCards = [
    {
      title: "Saldo do mês",
      subtitle: monthLabel,
      content: formatCurrency(balance),
      className:
        "bg-green-50 dark:bg-green-800/50 border-green-100 dark:border-green-800/50",
      valueClassName: balance >= 0 ? "text-[#10B981]" : "text-[#EF4444]",
    },
    {
      title: "Entradas do mês",
      subtitle: `Receitas em ${monthLabel}`,
      content: formatCurrency(totalIncomes),
      className:
        "bg-blue-50 dark:bg-blue-800/50 border-blue-100 dark:border-blue-800/50",
      valueClassName: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Saídas do mês",
      subtitle: `Despesas em ${monthLabel}`,
      content: formatCurrency(totalExpenses),
      className:
        "bg-red-50 dark:bg-red-800/50 border-red-100 dark:border-red-800/50",
      valueClassName: "text-[#EF4444]",
    },
    {
      title: "Economia do mês",
      subtitle: "Taxa de economia mensal",
      content: formatPercentage(economyRate),
      className:
        "bg-purple-50 dark:bg-purple-800/50 border-purple-100 dark:border-purple-800/50",
      valueClassName:
        (economyRate ?? 0) >= 0 ? "text-[#10B981]" : "text-[#EF4444]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
      {summaryCards.map((card) => (
        <SummaryCard key={card.title} isLoading={isLoading} {...card} />
      ))}

      <SummaryCard
        title="Maior gasto mensal"
        subtitle={`Categoria de ${monthLabel}`}
        isLoading={isLoading}
        className="bg-amber-50 dark:bg-amber-800/50 border-amber-100 dark:border-amber-800/50"
      >
        <p className="text-lg font-semibold text-[#1F2937] dark:text-white">
          {highestSpendingCategoryLabel}
        </p>
        <p className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-300">
          {formatCurrency(highestSpendingCategory?.total ?? 0)}
        </p>
      </SummaryCard>
    </div>
  );
};

export default SummaryCards;
