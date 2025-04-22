import UpdateUserForm from "@/components/config/updateUserForm";
import { Suspense } from "react";
import { getUser } from "./_services";
import { User } from "@/interfaces/user.interface";



export default async function Configurations() {
  const user: User | null = await getUser()
  return (
    <Suspense fallback={<div>Carregando dados do usuário...</div>}>
      {user ? <UpdateUserForm user={user}/> : 'Erro ao carregar usuário'}
    </Suspense>
  );
}