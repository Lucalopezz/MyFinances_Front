import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { updateUserAction } from "./_actions";


export default function Configurations() {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto rounded-lg shadow-md p-6 bg-gray-800/60">
        <div className="flex items-center mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold ml-2">Configurações</h1>
        </div>

        <form action={updateUserAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Seu nome"
              minLength={3}
              maxLength={50}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Nova senha"
              minLength={8}
              maxLength={128}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirmar nova senha"
              minLength={8}
              maxLength={128}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Link href="/dashboard">
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