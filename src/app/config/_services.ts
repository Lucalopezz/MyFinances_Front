import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { User } from "@/interfaces/user.interface";


export async function getUser(): Promise<User | null> {
  const session = await getServerSession(authOptions);

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/user/get-one`, {
      headers: {
        Authorization: `Bearer ${session?.jwt}`,
        "Content-Type": "application/json",
      },
      next: { tags: ["get-user"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - sessão expirada");
      }
      throw new Error("Falha ao buscar usuário");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro:", error);
    return null;
  }
}
