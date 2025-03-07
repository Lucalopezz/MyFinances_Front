"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton"; // Para exibir um loading state
import { useDashboard } from "@/hooks/queries/useDashboard";
import { useMonthlyComparison } from "@/hooks/queries/useMonthlyComparison";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardContent = ({ userId }: { userId: string }) => {
  // Usando o hook useDashboard para buscar os dados
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboard();

  // Usando o hook useMonthlyComparison para buscar os dados de comparação mensal
  const {
    data: monthlyData,
    isLoading: isMonthlyLoading,
    error: monthlyError,
  } = useMonthlyComparison(userId);

  // Função para formatar valores monetários em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Exibir mensagem de erro caso ocorra
  if (dashboardError || monthlyError) {
    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-4">
          Dashboard
        </h1>
        <div className="text-red-500">
          Erro: {dashboardError?.message || monthlyError?.message}
        </div>
      </div>
    );
  }

  // Dados para o gráfico
  const chartData = [
    {
      name: "Mês Anterior",
      Receitas: monthlyData?.previousMonth.totalIncomes || 0,
      Despesas: monthlyData?.previousMonth.totalExpenses || 0,
    },
    {
      name: "Mês Atual",
      Receitas: monthlyData?.currentMonth.totalIncomes || 0,
      Despesas: monthlyData?.currentMonth.totalExpenses || 0,
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      {/* Título do Dashboard */}
      <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-4">
        Dashboard
      </h1>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Card de Saldo */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-[#1F2937] dark:text-white">
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <Skeleton className="h-8 w-24" /> 
            ) : (
              <p className="text-2xl font-semibold text-[#10B981]">
                {formatCurrency(dashboardData?.balance || 0)}
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
            {isDashboardLoading ? (
              <Skeleton className="h-8 w-24" /> 
            ) : (
              <p className="text-2xl font-semibold text-[#10B981]">
                {formatCurrency(dashboardData?.totalIncomes || 0)}
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
            {isDashboardLoading ? (
              <Skeleton className="h-8 w-24" /> // Exibe um skeleton enquanto carrega
            ) : (
              <p className="text-2xl font-semibold text-[#EF4444]">
                {formatCurrency(dashboardData?.totalExpenses || 0)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gráficos */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-[#1F2937] dark:text-white">
            Comparativo Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isMonthlyLoading ? (
            <Skeleton className="h-48 sm:h-64 w-full" /> 
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="Receitas" fill="#10B981" />
                <Bar dataKey="Despesas" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Botão de Ação */}
      <div className="mt-6 flex justify-center sm:justify-start">
        <Button className="bg-[#10B981] hover:bg-[#059669] text-white">
          Adicionar Transação
        </Button>
      </div>

      {/* Badge de Status */}
      <div className="mt-4 flex justify-center sm:justify-start">
        <Badge variant="outline" className="text-[#10B981] border-[#10B981]">
          Status: Ativo
        </Badge>
      </div>
    </div>
  );
};

export default DashboardContent;
