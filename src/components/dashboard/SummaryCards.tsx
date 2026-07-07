import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
      {/* Card de Saldo */}
      <Card className="bg-green-50 dark:bg-green-800/50 border-green-100 dark:border-green-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-[#1F2937] dark:text-white">
            Saldo do mês
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {monthLabel}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p
              className={`text-2xl font-semibold ${
                balance >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
              }`}
            >
              {formatCurrency(balance)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card de Entradas */}
      <Card className="bg-blue-50 dark:bg-blue-800/50 border-blue-100 dark:border-blue-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-[#1F2937] dark:text-white">
            Entradas do mês
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Receitas em {monthLabel}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalIncomes)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card de Saídas */}
      <Card className="bg-red-50 dark:bg-red-800/50 border-red-100 dark:border-red-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-[#1F2937] dark:text-white">
            Saídas do mês
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Despesas em {monthLabel}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-semibold text-[#EF4444]">
              {formatCurrency(totalExpenses)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-purple-50 dark:bg-purple-800/50 border-purple-100 dark:border-purple-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-[#1F2937] dark:text-white">
            Economia do mês
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Taxa retornada pela API
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p
              className={`text-2xl font-semibold ${
                (economyRate ?? 0) >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
              }`}
            >
              {formatPercentage(economyRate)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-amber-50 dark:bg-amber-800/50 border-amber-100 dark:border-amber-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-[#1F2937] dark:text-white">
            Maior gasto mensal
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Categoria de {monthLabel}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <p className="text-lg font-semibold text-[#1F2937] dark:text-white">
                {highestSpendingCategoryLabel}
              </p>
              <p className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-300">
                {formatCurrency(highestSpendingCategory?.total ?? 0)}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
