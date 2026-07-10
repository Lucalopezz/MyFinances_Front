"use server";

import type { Transaction } from "@/models/transaction.model";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import { unstable_noStore as noStore } from "next/cache";
import {
  createApiError,
  createRequestError,
} from "@/lib/api-error";

export async function createTransaction(
  transaction: Omit<Transaction, "id">,
): Promise<Transaction | null> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const response = await fetch(`${backendUrl}/transactions`, {
      method: "POST",
      headers: createJsonHeaders(token),
      body: JSON.stringify(transaction),
    });

    if (!response.ok)
      throw await createApiError(response, {
        context: "POST /transactions",
        fallback: "Não foi possível criar a transação.",
      });

    return await response.json();
  } catch (error) {
    throw createRequestError(error, {
      context: "POST /transactions",
      fallback: "Não foi possível criar a transação.",
    });
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${backendUrl}/transactions`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["transactions"] },
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

export async function getTransaction(id: string): Promise<Transaction | null> {
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${backendUrl}/transactions/${id}`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["transaction"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Transação não encontrada");
      }
      return null;
    }

    const data: Transaction = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar transação:", error);
    return null;
  }
}

export async function updateTransaction(
  id: string,
  transaction: Omit<Transaction, "id">,
): Promise<Transaction | null> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const response = await fetch(`${backendUrl}/transactions/${id}`, {
      method: "PATCH",
      headers: createJsonHeaders(token),
      body: JSON.stringify(transaction),
      next: { tags: ["transaction"] },
    });

    if (!response.ok)
      throw await createApiError(response, {
        context: `PATCH /transactions/${id}`,
        fallback: "Não foi possível atualizar a transação.",
      });

    const data: Transaction = await response.json();
    return data;
  } catch (error) {
    throw createRequestError(error, {
      context: `PATCH /transactions/${id}`,
      fallback: "Não foi possível atualizar a transação.",
    });
  }
}

export async function deleteTransaction(
  id: string | undefined,
): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const response = await fetch(`${backendUrl}/transactions/${id}`, {
      method: "DELETE",
      headers: createJsonHeaders(token),
    });

    if (!response.ok)
      throw await createApiError(response, {
        context: `DELETE /transactions/${id}`,
        fallback: "Não foi possível excluir a transação.",
      });

    return true;
  } catch (error) {
    throw createRequestError(error, {
      context: `DELETE /transactions/${id}`,
      fallback: "Não foi possível excluir a transação.",
    });
  }
}
