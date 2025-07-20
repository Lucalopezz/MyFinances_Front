import { getServerSession } from "next-auth";
import { UpdateUserInput, User } from "@/interfaces/user.interface";
import { authOptions } from "../api/auth/[...nextauth]/route";

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

export async function updateUser(userData: UpdateUserInput): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    console.error("Não autorizado - sessão não encontrada");
    return false;
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/user/update`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      next: { tags: ["users"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Usuário não encontrado");
      }
      throw new Error(`Falha ao atualizar usuário: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return false;
  }
}
