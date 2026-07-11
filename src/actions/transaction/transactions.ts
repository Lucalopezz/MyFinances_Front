"use server";

import type {
  PaginatedTransactions,
  Transaction,
} from "@/models/transaction.model";
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

const TRANSACTIONS_PER_PAGE = 50;

function emptyTransactionsPage(page: number): PaginatedTransactions {
  return {
    data: [],
    meta: {
      page,
      limit: TRANSACTIONS_PER_PAGE,
      total: 0,
      totalPages: 0,
    },
  };
}

function normalizeTransactionsResponse(
  responseData: unknown,
  page: number,
): PaginatedTransactions {
  if (Array.isArray(responseData)) {
    return {
      data: responseData as Transaction[],
      meta: {
        page,
        limit: TRANSACTIONS_PER_PAGE,
        total: responseData.length,
        totalPages: responseData.length > 0 ? 1 : 0,
      },
    };
  }

  if (!responseData || typeof responseData !== "object") {
    return emptyTransactionsPage(page);
  }

  const response = responseData as {
    data?: unknown;
    meta?: {
      page?: unknown;
      limit?: unknown;
      total?: unknown;
      totalPages?: unknown;
    };
  };
  const data = Array.isArray(response.data)
    ? (response.data as Transaction[])
    : [];
  const limit =
    typeof response.meta?.limit === "number" &&
    Number.isInteger(response.meta.limit) &&
    response.meta.limit > 0
      ? response.meta.limit
      : TRANSACTIONS_PER_PAGE;
  const total =
    typeof response.meta?.total === "number" &&
    Number.isInteger(response.meta.total) &&
    response.meta.total >= 0
      ? response.meta.total
      : data.length;

  return {
    data,
    meta: {
      page:
        typeof response.meta?.page === "number" &&
        Number.isInteger(response.meta.page) &&
        response.meta.page > 0
          ? response.meta.page
          : page,
      limit,
      total,
      totalPages:
        typeof response.meta?.totalPages === "number" &&
        Number.isInteger(response.meta.totalPages) &&
        response.meta.totalPages >= 0
          ? response.meta.totalPages
          : total > 0
            ? Math.ceil(total / limit)
            : 0,
    },
  };
}

export async function getTransactions(
  page = 1,
): Promise<PaginatedTransactions> {
  noStore();

  const normalizedPage = Number.isInteger(page) && page > 0 ? page : 1;

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    return emptyTransactionsPage(normalizedPage);
  }

  try {
    const searchParams = new URLSearchParams({
      page: String(normalizedPage),
      limit: String(TRANSACTIONS_PER_PAGE),
    });
    const response = await fetch(`${backendUrl}/transactions?${searchParams}`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["transactions"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - sessão expirada");
      }
      return emptyTransactionsPage(normalizedPage);
    }

    return normalizeTransactionsResponse(await response.json(), normalizedPage);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return emptyTransactionsPage(normalizedPage);
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
