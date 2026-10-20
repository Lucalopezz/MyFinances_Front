"use server";

// Transporte compartilhado de metas e reservas: GET/HEAD têm prazo e repetição
// limitada em falhas transitórias; gravações continuam com envio único. URL,
// cookie e Authorization são tratados no servidor pelos consumidores abaixo.
// A política completa fica em backend-fetch.ts, sem duplicar timers neste domínio.
import { backendFetch } from "@/lib/backend-fetch";

import { NewWish, WishListInterface, WishSummary } from "@/models/wishlist.model";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import { unstable_noStore as noStore } from "next/cache";
import {
  createApiError,
  createRequestError,
} from "@/lib/api-error";
import { toDateInputValue } from "@/utils/date";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createWish(data: NewWish): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const response = await backendFetch(`${backendUrl}/wishlist`, {
      method: "POST",
      headers: createJsonHeaders(token),
      body: JSON.stringify({
        ...data,
        targetDate: data.targetDate ? toDateInputValue(data.targetDate) : null,
      }),
    });

    if (!response.ok)
      throw await createApiError(response, {
        context: "POST /wishlist",
        fallback: "Não foi possível adicionar o item à lista de desejos.",
      });

    return true;
  } catch (error) {
    throw createRequestError(error, {
      context: "POST /wishlist",
      fallback: "Não foi possível adicionar o item à lista de desejos.",
    });
  }
}

// Não interpretamos erro de conexão como ausência de metas. Lançar erro evita
// substituir a lista anterior por [] e permite refazer a consulta após recuperar.
export async function getWishList(): Promise<WishListInterface[]> {
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  try {
    const response = await backendFetch(`${backendUrl}/wishlist`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["wishlist"] },
    });

    if (!response.ok) throw await createApiError(response, {
      context: "GET /wishlist",
      fallback: "Não foi possível carregar suas metas.",
    });

    return await response.json();
  } catch (error) {
    throw createRequestError(error, {
      context: "GET /wishlist",
      fallback: "Não foi possível carregar suas metas.",
    });
  }
}

export async function deleteWish(id: string | undefined): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const response = await backendFetch(`${backendUrl}/wishlist/${id}`, {
      method: "DELETE",
      headers: createJsonHeaders(token),
    });

    if (!response.ok)
      throw await createApiError(response, {
        context: `DELETE /wishlist/${id}`,
        fallback: "Não foi possível excluir o item da lista de desejos.",
      });

    return true;
  } catch (error) {
    throw createRequestError(error, {
      context: `DELETE /wishlist/${id}`,
      fallback: "Não foi possível excluir o item da lista de desejos.",
    });
  }
}

// A distinção entre 404 e indisponibilidade também importa na edição: o primeiro
// mostra uma meta inexistente; o segundo usa a fronteira de erro recuperável.
export async function getWish(id: string): Promise<WishListInterface | null> {
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    return null;
  }

  try {
    const response = await backendFetch(`${backendUrl}/wishlist/${id}`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["wishlist"] },
    });

    if (response.status === 404) return null;
    if (!response.ok) throw await createApiError(response, {
      context: "GET /wishlist/:id",
      fallback: "Não foi possível carregar a meta.",
    });

    const data: WishListInterface = await response.json();
    return data;
  } catch (error) {
    throw createRequestError(error, {
      context: "GET /wishlist/:id",
      fallback: "Não foi possível carregar a meta.",
    });
  }
}

export async function updateWish(
  id: string,
  wishData: {
    name: string;
    desiredValue: number;
    targetDate: string | null;
  },
): Promise<WishListInterface | null> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const formattedWishData = {
      name: wishData.name,
      desiredValue: wishData.desiredValue,
      targetDate: wishData.targetDate,
    };

    const response = await backendFetch(`${backendUrl}/wishlist/${id}`, {
      method: "PATCH",
      headers: createJsonHeaders(token),
      body: JSON.stringify(formattedWishData),
      next: { tags: ["wishlist"] },
    });

    if (!response.ok)
      throw await createApiError(response, {
        context: `PATCH /wishlist/${id}`,
        fallback: "Não foi possível atualizar o item da lista de desejos.",
      });

    const data: WishListInterface = await response.json();
    return data;
  } catch (error) {
    throw createRequestError(error, {
      context: `PATCH /wishlist/${id}`,
      fallback: "Não foi possível atualizar o item da lista de desejos.",
    });
  }
}

async function wishlistRequest<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  noStore();
  const token = await getServerToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
  const context = `${method} /wishlist${path}`;
  try {
    const response = await backendFetch(`${getServerBackendUrl()}/wishlist${path}`, {
      method,
      headers: createJsonHeaders(token),
      cache: "no-store",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) throw await createApiError(response, {
      context,
      fallback: "Não foi possível atualizar a meta.",
    });
    return (await response.json()) as T;
  } catch (error) {
    throw createRequestError(error, { context, fallback: "Não foi possível atualizar a meta." });
  }
}

function revalidateWishlist(purchase = false) {
  for (const tag of ["wishlist", "dashboard", "forecast", "calendar", "transactions", "transaction", "budgets", "monthlyComparison", "sixMonthComparison"])
    revalidateTag(tag);
  for (const path of ["/wishlist", "/dashboard", "/calendar", "/transactions", "/comparative"])
    revalidatePath(path);
  if (purchase) revalidatePath("/budgets");
}

export async function getWishSummary(): Promise<WishSummary> {
  return wishlistRequest<WishSummary>("/summary");
}

export async function addWishMovement(id: string, input: {
  kind: "DEPOSIT" | "WITHDRAWAL";
  value: number;
  date: string;
  note?: string;
}) {
  const item = await wishlistRequest<WishListInterface>(`/${encodeURIComponent(id)}/movements`, "POST", input);
  revalidateWishlist();
  return item;
}

export async function settleWishMigration() {
  const items = await wishlistRequest<WishListInterface[]>("/settle-migration", "POST");
  revalidateWishlist();
  return items;
}

export async function completeWish(id: string, input: {
  value: number;
  date: string;
  category: string;
  description: string;
}) {
  const result = await wishlistRequest<{
    item: WishListInterface;
    transaction: { id: string };
    coveredAmount?: number;
    releasedAmount?: number;
    uncoveredAmount?: number;
    alreadyCompleted: boolean;
  }>(`/${encodeURIComponent(id)}/complete`, "POST", input);
  revalidateWishlist(true);
  return result;
}
