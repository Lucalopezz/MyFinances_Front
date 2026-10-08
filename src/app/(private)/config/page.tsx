import UpdateUserForm from "@/components/config/update-user-form";
import { getUser } from "@/actions/user/user";
import { User } from "@/models/user.model";
import { SessionExpired } from "@/components/auth/session-expired";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Configurations() {
  // getUser só retorna null para sessão ausente/401. Falhas transitórias sobem
  // até a fronteira privada; portanto não podem renderizar SessionExpired abaixo.
  const user: User | null = await getUser();
  return user ? <UpdateUserForm user={user} /> : <SessionExpired />;
}
