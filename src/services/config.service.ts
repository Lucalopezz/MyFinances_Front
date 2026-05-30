import { UpdateUserInput, User } from "@/interfaces/user.interface";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import { unstable_noStore as noStore } from "next/cache";

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<User | null> {
  const backendUrl = getServerBackendUrl();

  try {
    const response = await fetch(`${backendUrl}/user`, {
      method: "POST",
      headers: createJsonHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Falha ao criar usuário: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return null;
  }
}

export async function getUser(): Promise<User | null> {
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${backendUrl}/user/get-one`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["get-user"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - sessão expirada");
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Erro:", error);
    return null;
  }
}

export async function updateUser(userData: UpdateUserInput): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    console.error("Não autorizado - sessão não encontrada");
    return false;
  }

  try {
    const response = await fetch(`${backendUrl}/user/update`, {
      method: "PATCH",
      headers: createJsonHeaders(token),
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
