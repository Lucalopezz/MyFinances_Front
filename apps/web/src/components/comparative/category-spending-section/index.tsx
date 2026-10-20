import type {
  CategorySpending,
  ComparativeBlock,
} from "@/models/dashboard.model";
import BlockMessage from "../block-message";
import CategorySpendingChart from "../category-spending-chart";

interface CategorySpendingSectionProps {
  spending: ComparativeBlock<CategorySpending[]>;
}

export default function CategorySpendingSection({
  spending,
}: CategorySpendingSectionProps) {
  if (spending.error) {
    return (
      <BlockMessage
        title="Gastos por categoria"
        message={spending.error}
        tone="error"
      />
    );
  }

  if (!spending.data?.length) {
    return (
      <BlockMessage
        title="Gastos por categoria"
        message="Nenhuma despesa por categoria foi encontrada no semestre."
      />
    );
  }

  return <CategorySpendingChart data={spending.data} isLoading={false} />;
}
