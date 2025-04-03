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
import { getFixedExpense } from "../../_services";

import { Switch } from "@/components/ui/switch";
import { updateFixedExpenseAction } from "../../_actions";



export default async function EditFixedExpensePage({
  params,
}: {
  params: { id: string };
}) {
  const id = await params.id;

  let fixedExpense;
  try {
    fixedExpense = await getFixedExpense(id);
  } catch (error) {
    return (
      <div className="p-4">
        <p>Erro ao carregar despesa fixa</p>
        <Link href="/fixed-expenses">
          <Button className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

  if (!fixedExpense) {
    return (
      <div className="p-4">
        <p>Despesa fixa não encontrada</p>
        <Link href="/fixed-expenses">
          <Button className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

  const formattedDate = fixedExpense.dueDate
    ? new Date(fixedExpense.dueDate).toISOString().split("T")[0]
    : "";

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto rounded-lg shadow-md p-6 bg-gray-800/60">
        <div className="flex items-center mb-6">
          <Link href="/fixed-expenses">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold ml-2">Editar Despesa Fixa</h1>
        </div>

        <form action={updateFixedExpenseAction} className="space-y-4">
          <input type="hidden" name="id" value={fixedExpense.id} />

          <div className="space-y-1">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={fixedExpense.name}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                defaultValue={fixedExpense.amount}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={formattedDate}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="recurrence">Recorrência</Label>
              <Select name="recurrence" defaultValue={fixedExpense.recurrence} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Mensal</SelectItem>
                  <SelectItem value="BIMONTHLY">Bimestral</SelectItem>
                  <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                  <SelectItem value="SEMIANNUAL">Semestral</SelectItem>
                  <SelectItem value="ANNUAL">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 flex flex-col justify-end">
              <Label htmlFor="isPaid" className="mb-2">Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPaid"
                  name="isPaid"
                  defaultChecked={fixedExpense.isPaid}
                />
                <Label htmlFor="isPaid">
                  {fixedExpense.isPaid ? "Pago" : "Pendente"}
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Link href="/fixed-expenses">
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