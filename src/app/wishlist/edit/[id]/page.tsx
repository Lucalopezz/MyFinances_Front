import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getWish } from "../../_services";
import { updateWishAction } from "../../_actions";

export default async function EditWishPage({
  params,
}: {
  params: { id: string };
}) {
  const id = await params.id;

  let wish;
  try {
    wish = await getWish(id);
  } catch (error) {
    return (
      <div className="p-4">
        <p>Erro ao carregar item de desejo</p>
        <Link href="/wishlist">
          <Button className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="p-4">
        <p>Item de desejo não encontrado</p>
        <Link href="/wishlist">
          <Button className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

  const formattedDate = wish.targetDate
    ? new Date(wish.targetDate).toISOString().split("T")[0]
    : "";

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto rounded-lg shadow-md p-6 bg-gray-800/60">
        <div className="flex items-center mb-6">
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold ml-2">Editar Item de Desejo</h1>
        </div>

        <form action={updateWishAction} className="space-y-4">
          <input type="hidden" name="id" value={wish.id} />

          <div className="space-y-1">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={wish.name}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="desiredValue">Valor Desejado</Label>
              <Input
                id="desiredValue"
                name="desiredValue"
                type="number"
                step="0.01"
                defaultValue={wish.desiredValue}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="targetDate">Data Alvo</Label>
              <Input
                id="targetDate"
                name="targetDate"
                type="date"
                defaultValue={formattedDate}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="savedAmount">Valor Economizado</Label>
            <Input
              id="savedAmount"
              name="savedAmount"
              type="number"
              step="0.01"
              defaultValue={wish.savedAmount}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Link href="/wishlist">
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
