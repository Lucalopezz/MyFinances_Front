"use server";

// Transporte compartilhado de busca e totais de transações: GET/HEAD têm prazo e repetição
// limitada em falhas transitórias; gravações continuam com envio único. URL,
// cookie e Authorization são tratados no servidor pelos consumidores abaixo.
// A política completa fica em backend-fetch.ts, sem duplicar timers neste domínio.
import { backendFetch } from "@/lib/backend-fetch";

import { unstable_noStore as noStore } from "next/cache";

import { categoryReferenceSchema } from "@/schemas/category.schema";
import { createApiError, createRequestError } from "@/lib/api-error";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import type {
  TransactionSearchFilters,
  TransactionSearchPage,
  TransactionTotals,
} from "@/models/transaction.model";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function searchParams(filters: TransactionSearchFilters) {
  const params = new URLSearchParams();
  if (filters.startDate && DATE_PATTERN.test(filters.startDate))
    params.set("startDate", filters.startDate);
  if (filters.endDate && DATE_PATTERN.test(filters.endDate))
    params.set("endDate", filters.endDate);
  if (filters.type === "INCOME" || filters.type === "EXPENSE")
    params.set("type", filters.type);
  if (
    filters.category &&
    categoryReferenceSchema.safeParse(filters.category).success
  )
    params.set("category", filters.category);
  if (filters.search?.trim())
    params.set("search", filters.search.trim().slice(0, 100));
  return params;
}

export async function getTransactionTotals(
  filters: TransactionSearchFilters,
): Promise<TransactionTotals> {
  noStore();
  const token = await getServerToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
  const context = "GET /transactions/summary";
  const fallback = "Não foi possível carregar os totais das transações.";
  try {
    const response = await backendFetch(
      `${getServerBackendUrl()}/transactions/summary?${searchParams(filters)}`,
      {
        headers: createJsonHeaders(token),
        cache: "no-store",
      },
    );
    if (!response.ok)
      throw await createApiError(response, { context, fallback });
    return (await response.json()) as TransactionTotals;
  } catch (error) {
    throw createRequestError(error, { context, fallback });
  }
}

export async function getTotalBalance(): Promise<TransactionTotals> {
  noStore();
  const token = await getServerToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
  const context = "GET /transactions/balance";
  const fallback = "Não foi possível carregar o saldo total.";
  try {
    const response = await backendFetch(
      `${getServerBackendUrl()}/transactions/balance`,
      {
        headers: createJsonHeaders(token),
        cache: "no-store",
        next: { tags: ["transactions"] },
      },
    );
    if (!response.ok)
      throw await createApiError(response, { context, fallback });
    return (await response.json()) as TransactionTotals;
  } catch (error) {
    throw createRequestError(error, { context, fallback });
  }
}

export async function searchTransactions(
  filters: TransactionSearchFilters = {},
  cursor?: string,
): Promise<TransactionSearchPage | null> {
  noStore();
  const token = await getServerToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  const params = searchParams(filters);
  params.set("limit", "50");
  if (cursor && cursor.length <= 512) params.set("cursor", cursor);

  try {
    const response = await backendFetch(
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
