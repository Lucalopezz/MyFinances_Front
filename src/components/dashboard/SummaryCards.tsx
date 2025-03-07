import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/formatters";


interface SummaryCardsProps {
  balance: number;
  totalIncomes: number;
  totalExpenses: number;
  isLoading: boolean;
}

const SummaryCards = ({
  balance,
  totalIncomes,
  totalExpenses,
  isLoading,
}: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Card de Saldo */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-[#1F2937] dark:text-white">
            Saldo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-semibold text-[#10B981]">
              {formatCurrency(balance)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card de Entradas */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-[#1F2937] dark:text-white">
            Entradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-semibold text-[#10B981]">
              {formatCurrency(totalIncomes)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card de Saídas */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-[#1F2937] dark:text-white">
            Saídas
          </CardTitle>
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
    </div>
  );
};

export default SummaryCards;
