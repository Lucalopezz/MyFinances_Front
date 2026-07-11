import { UpdateUserInput, User } from "@/models/user.model";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import { unstable_noStore as noStore } from "next/cache";
import {
  createApiError,
  createRequestError,
} from "@/lib/api-error";

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

    if (!response.ok)
      throw await createApiError(response, {
        context: "POST /user",
        fallback: "Não foi possível criar sua conta.",
      });

    return await response.json();
  } catch (error) {
    throw createRequestError(error, {
      context: "POST /user",
      fallback: "Não foi possível criar sua conta.",
    });
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

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const response = await fetch(`${backendUrl}/user/update`, {
      method: "PATCH",
      headers: createJsonHeaders(token),
      body: JSON.stringify(userData),
      next: { tags: ["users"] },
    });

    if (!response.ok)
      throw await createApiError(response, {
        context: "PATCH /user/update",
        fallback: "Não foi possível atualizar seus dados.",
      });

    return true;
  } catch (error) {
    throw createRequestError(error, {
      context: "PATCH /user/update",
      fallback: "Não foi possível atualizar seus dados.",
    });
  }
}
