// Transporte compartilhado de perfil e cadastro: GET/HEAD têm prazo e repetição
// limitada em falhas transitórias; gravações continuam com envio único. URL,
// cookie e Authorization são tratados no servidor pelos consumidores abaixo.
// A política completa fica em backend-fetch.ts, sem duplicar timers neste domínio.
import { backendFetch } from "@/lib/backend-fetch";
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
    const response = await backendFetch(`${backendUrl}/user`, {
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

/**
 * null tem significado de sessão ausente/inválida, não de API indisponível.
 * Configurações renderiza SessionExpired para null; qualquer falha temporária
 * precisa ser propagada para a fronteira recuperável, sem apagar a sessão.
 */
export async function getUser(): Promise<User | null> {
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    return null;
  }

  try {
    const response = await backendFetch(`${backendUrl}/user/get-one`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["get-user"] },
    });

    // Somente um 401 real pode seguir o mesmo caminho do token ausente.
    // 503/timeout não comprovam expiração e não devem acionar SessionExpired.
    if (response.status === 401) return null;
    if (!response.ok) throw await createApiError(response, {
      context: "GET /user/get-one",
      fallback: "Não foi possível carregar seu perfil.",
    });

    return await response.json();
  } catch (error) {
    // Normaliza o erro para a UI e mantém a falha explícita. Retornar null aqui
    // confundiria cold start com logout; retornar um perfil falso esconderia erro.
    throw createRequestError(error, {
      context: "GET /user/get-one",
      fallback: "Não foi possível carregar seu perfil.",
    });
  }
}

export async function updateUser(userData: UpdateUserInput): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const response = await backendFetch(`${backendUrl}/user/update`, {
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
