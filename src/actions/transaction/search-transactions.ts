"use server";

import { unstable_noStore as noStore } from "next/cache";

import { TRANSACTION_CATEGORIES } from "@/constants/transaction-categories";
import { createApiError, createRequestError } from "@/lib/api-error";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import type {
  TransactionSearchFilters,
  TransactionSearchPage,
} from "@/models/transaction.model";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function searchTransactions(
  filters: TransactionSearchFilters = {},
  cursor?: string,
): Promise<TransactionSearchPage | null> {
  noStore();
  const token = await getServerToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  const params = new URLSearchParams({ limit: "50" });
  if (cursor && cursor.length <= 512) params.set("cursor", cursor);
  if (filters.startDate && DATE_PATTERN.test(filters.startDate)) {
    params.set("startDate", filters.startDate);
  }
  if (filters.endDate && DATE_PATTERN.test(filters.endDate)) {
    params.set("endDate", filters.endDate);
  }
  if (filters.type === "INCOME" || filters.type === "EXPENSE") {
    params.set("type", filters.type);
  }
  if (filters.category && TRANSACTION_CATEGORIES.includes(filters.category)) {
    params.set("category", filters.category);
  }
  if (filters.search?.trim()) params.set("search", filters.search.trim().slice(0, 100));

  try {
    const response = await fetch(
      `${getServerBackendUrl()}/transactions/search?${params}`,
      {
        headers: createJsonHeaders(token),
        cache: "no-store",
        next: { tags: ["transactions"] },
      },
    );

    // A instalação em produção pode ainda estar na versão anterior da API.
    if (response.status === 404) return null;
    if (!response.ok) {
      throw await createApiError(response, {
        context: "GET /transactions/search",
        fallback: "Não foi possível buscar as transações.",
      });
    }

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object") {
      throw new Error("A busca retornou uma resposta inválida.");
    }
    const page = payload as Partial<TransactionSearchPage>;
    if (!Array.isArray(page.data) || typeof page.hasMore !== "boolean") {
      throw new Error("A busca retornou uma resposta inválida.");
    }

    return {
      data: page.data,
      nextCursor: typeof page.nextCursor === "string" ? page.nextCursor : null,
      hasMore: page.hasMore,
    };
  } catch (error) {
    throw createRequestError(error, {
      context: "GET /transactions/search",
      fallback: "Não foi possível buscar as transações.",
    });
  }
}
