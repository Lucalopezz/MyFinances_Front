import UpdateUserForm from "@/components/config/update-user-form";
import { getUser } from "@/actions/user/user";
import { User } from "@/models/user.model";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Configurations() {
  const user: User | null = await getUser();
  return user ? <UpdateUserForm user={user} /> : "Erro ao carregar usuário";
}
