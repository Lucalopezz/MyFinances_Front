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
import { getTransaction, updateTransaction } from "../../_services";
import { Textarea } from "@/components/ui/textarea";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";

async function updateTransactionAction(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;

  if (!id) {
    console.error("Transaction ID is missing");
    throw new Error("ID da transação não fornecido");
  }

  try {
    const transactionData = {
      value: parseFloat(formData.get("value") as string),
      date: formData.get("date") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      type: formData.get("type") as "EXPENSE" | "INCOME",
    };

    const updated = await updateTransaction(id, transactionData);

    if (!updated) {
      throw new Error("Falha ao atualizar transação");
    }
    revalidateTag("transactions");
    redirect("/transactions");
  } catch (error) {
    console.error("Error in updateTransactionAction:", error);
    throw error;
  }
}

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

  let transaction;
  try {
    transaction = await getTransaction(id);
  } catch (error) {
    return (
      <div className="p-4">
        <p>Erro ao carregar transação</p>
        <Link href="/transactions">
          <Button className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

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
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto rounded-lg shadow-md p-6 bg-gray-800/60">
        <div className="flex items-center mb-6">
          <Link href="/transactions">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold ml-2">Editar Transação</h1>
        </div>

        <form action={updateTransactionAction} className="space-y-4">
          <input type="hidden" name="id" value={transaction.id} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={formattedDate}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                defaultValue={transaction.value}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={transaction.description}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                name="category"
                defaultValue={transaction.category}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="type">Tipo</Label>
              <Select name="type" defaultValue={transaction.type} required>
                <SelectTrigger>
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
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
