"use server";

import { NewWish, WishListInterface } from "@/models/wishlist.model";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import { unstable_noStore as noStore } from "next/cache";
import {
  createApiError,
  createRequestError,
} from "@/lib/api-error";

export async function createWish(data: NewWish): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const response = await fetch(`${backendUrl}/wishlist`, {
      method: "POST",
      headers: createJsonHeaders(token),
      body: JSON.stringify(data),
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

export async function getWishList(): Promise<WishListInterface[]> {
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${backendUrl}/wishlist`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["wishlist"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - sessão expirada");
      }
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Erro:", error);
    return [];
  }
}

export async function deleteWish(id: string | undefined): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const response = await fetch(`${backendUrl}/wishlist/${id}`, {
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

export async function getWish(id: string): Promise<WishListInterface | null> {
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${backendUrl}/wishlist/${id}`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["wishlist"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Item de desejo não encontrado");
      }
      return null;
    }

    const data: WishListInterface = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar item de desejo:", error);
    return null;
  }
}

export async function updateWish(
  id: string,
  wishData: {
    name: string;
    desiredValue: number;
    targetDate: string;
    savedAmount: number;
  },
): Promise<WishListInterface | null> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const formattedWishData = {
      name: wishData.name,
      desiredValue: wishData.desiredValue,
      targetDate: new Date(wishData.targetDate),
      savedAmount: wishData.savedAmount,
    };

    const response = await fetch(`${backendUrl}/wishlist/${id}`, {
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
