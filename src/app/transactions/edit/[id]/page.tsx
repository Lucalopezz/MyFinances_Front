import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTransaction } from "../../_services";
import { Textarea } from "@/components/ui/textarea";

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string };
}) {
  const transaction = await getTransaction(params.id);

  if (!transaction) {
    return (
      <div className="p-4">
        <p>Transação não encontrada</p>
        <Link href="/transactions">
          <Button className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

  const formattedDate = transaction.date
    ? new Date(transaction.date).toISOString().split("T")[0]
    : "";

  return (
    <div className=" min-h-screen p-4">
      <div className="max-w-md mx-auto rounded-lg shadow-md p-6 bg-gray-800/60">
        <div className="flex items-center mb-6">
          <Link href="/transactions">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold ml-2">Editar Transação</h1>
        </div>

        <form className="space-y-4 ">
          <input type="hidden" name="id" value={transaction.id} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="date" className="text-sm font-medium">
                Data
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={formattedDate}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="value" className="text-sm font-medium">
                Valor
              </Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                defaultValue={transaction.value}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={transaction.description}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="category" className="text-sm font-medium">
                Categoria
              </Label>
              <Input
                id="category"
                name="category"
                defaultValue={transaction.category}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="type" className="text-sm font-medium">
                Tipo
              </Label>
              <Select name="type" defaultValue={transaction.type} required>
                <SelectTrigger className="w-full p-2 border rounded">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Entrada</SelectItem>
                  <SelectItem value="EXPENSE">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Link href="/transactions">
              <Button
                variant="outline"
                type="button"
                className="px-4 py-2 border rounded bg-[#364152] border-none text-white hover:bg-[#4A5567]"
              >
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
