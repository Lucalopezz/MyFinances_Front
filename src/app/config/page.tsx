import UpdateUserForm from "@/components/config/updateUserForm";
import { Suspense } from "react";
import { getUser } from "@/services/config.service";
import { User } from "@/interfaces/user.interface";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Configurations() {
  const user: User | null = await getUser();
  return (
    <Suspense fallback={<div>Carregando dados do usuário...</div>}>
      {user ? <UpdateUserForm user={user} /> : "Erro ao carregar usuário"}
    </Suspense>
  );
}
