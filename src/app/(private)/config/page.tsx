import UpdateUserForm from "@/components/config/update-user-form";
import { Suspense } from "react";
import { getUser } from "@/actions/user/user";
import { User } from "@/models/user.model";

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
