import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DashboardActions = () => {
  return (
    <>
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
    </>
  );
};

export default DashboardActions;