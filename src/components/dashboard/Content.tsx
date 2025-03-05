import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DashboardContent = () => {
  return (
    <div className="p-6">
      {/* Título do Dashboard */}
      <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-4">
        Dashboard
      </h1>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Card de Saldo */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-[#1F2937] dark:text-white">
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[#10B981]">R$ 5.000,00</p>
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
            <p className="text-2xl font-semibold text-[#10B981]">R$ 7.000,00</p>
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
            <p className="text-2xl font-semibold text-[#EF4444]">R$ 2.000,00</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gráficos */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-[#1F2937] dark:text-white">
            Gráficos & Comparativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-[#9CA3AF]">
            [Gráficos Placeholder]
          </div>
        </CardContent>
      </Card>

      {/* Botão de Ação */}
      <div className="mt-6">
        <Button className="bg-[#10B981] hover:bg-[#059669] text-white">
          Adicionar Transação
        </Button>
      </div>

      {/* Badge de Status */}
      <div className="mt-4">
        <Badge variant="outline" className="text-[#10B981] border-[#10B981]">
          Status: Ativo
        </Badge>
      </div>
    </div>
  );
};

export default DashboardContent;
