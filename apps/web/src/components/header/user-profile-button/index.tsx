import Link from "next/link";
import { User } from "lucide-react";

/** Oferece acesso ao perfil nas configurações pela navegação nativa de um link. */
export const UserProfileButton = () => {
  return (
    <Link
      href="/config"
      className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      aria-label="Configurações do usuário"
    >
      <User className="w-5 h-5" aria-hidden="true" />
    </Link>
  );
};
