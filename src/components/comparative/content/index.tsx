import type { SemesterComparisonData } from "@/models/dashboard.model";
import { formatDateRange } from "@/utils/formatters";
import CategorySpendingSection from "../category-spending-section";
import MonthlyChartsSection from "../monthly-charts-section";
import PeriodHighlights from "../period-highlights";
import PreviousSemesterComparison from "../previous-semester-comparison";
import SemesterSummarySection from "../semester-summary-section";

interface ComparativeContentProps {
  comparison: SemesterComparisonData;
}

export default function ComparativeContent({
  comparison,
}: ComparativeContentProps) {
  const currentPeriodLabel = formatDateRange(
    comparison.currentPeriod.start,
    comparison.currentPeriod.end,
  );
  const previousPeriodLabel = formatDateRange(
    comparison.previousPeriod.start,
    comparison.previousPeriod.end,
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Análise Comparativa Semestral
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Semestre atual: {currentPeriodLabel}
        </p>
      </div>

      <SemesterSummarySection
        summary={comparison.currentSummary}
        balancePercentageChange={comparison.balancePercentageChange}
      />

      <MonthlyChartsSection comparison={comparison.monthlyComparison} />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PeriodHighlights comparison={comparison.monthlyComparison} />
        <PreviousSemesterComparison
          currentSummary={comparison.currentSummary}
          previousSummary={comparison.previousSummary}
          currentPeriodLabel={currentPeriodLabel}
          previousPeriodLabel={previousPeriodLabel}
        />
      </div>

      <CategorySpendingSection spending={comparison.categorySpending} />
    </div>
  );
}
