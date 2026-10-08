"use server";

// Transporte compartilhado de despesas fixas: GET/HEAD têm prazo e repetição
// limitada em falhas transitórias; gravações continuam com envio único. URL,
// cookie e Authorization são tratados no servidor pelos consumidores abaixo.
// A política completa fica em backend-fetch.ts, sem duplicar timers neste domínio.
import { backendFetch } from "@/lib/backend-fetch";

import type {
  FixedExpense,
  FixedExpensePaymentResult,
} from "@/models/fixed-expense.model";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import { unstable_noStore as noStore } from "next/cache";
import {
  createApiError,
  createRequestError,
} from "@/lib/api-error";

export async function createFixedExpense(
  fixedExpense: Omit<FixedExpense, "id">,
): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  try {
    const response = await backendFetch(`${backendUrl}/fixed-expenses`, {
      method: "POST",
      headers: createJsonHeaders(token),
      body: JSON.stringify(fixedExpense),
    });

    if (!response.ok)
      throw await createApiError(response, {
        context: "POST /fixed-expenses",
        fallback: "Não foi possível criar a despesa fixa.",
      });

    return true;
  } catch (error) {
    throw createRequestError(error, {
      context: "POST /fixed-expenses",
      fallback: "Não foi possível criar a despesa fixa.",
    });
  }
}

// [] só é dado válido quando a API responde uma lista vazia. Em indisponibilidade,
// lançamos erro para preservar dados em cache e permitir a recuperação da leitura.
export async function getFixedExpenses(): Promise<FixedExpense[]> {
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  try {
    const response = await backendFetch(`${backendUrl}/fixed-expenses`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["fixed-expenses"] },
    });

    if (!response.ok) throw await createApiError(response, {
      context: "GET /fixed-expenses",
      fallback: "Não foi possível carregar as despesas fixas.",
    });

    return await response.json();
  } catch (error) {
    throw createRequestError(error, {
      context: "GET /fixed-expenses",
      fallback: "Não foi possível carregar as despesas fixas.",
    });
  }
}

// Uma despesa realmente ausente (404) continua retornando null; falhas de rede
// e demais respostas sem sucesso chegam ao tratamento público de erros.
export async function getFixedExpense(
  id: string,
): Promise<FixedExpense | null> {
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    return null;
  }

  try {
    const response = await backendFetch(`${backendUrl}/fixed-expenses/${id}`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["fixed-expense"] },
    });

    if (response.status === 404) return null;
    if (!response.ok) throw await createApiError(response, {
      context: "GET /fixed-expenses/:id",
      fallback: "Não foi possível carregar a despesa fixa.",
    });

    const data: FixedExpense = await response.json();
    return data;
  } catch (error) {
    throw createRequestError(error, {
      context: "GET /fixed-expenses/:id",
      fallback: "Não foi possível carregar a despesa fixa.",
    });
  }
}

export async function updateFixedExpense(
  id: string,
  fixedExpense: Omit<FixedExpense, "id">,
): Promise<FixedExpense | null> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  try {
    const response = await backendFetch(`${backendUrl}/fixed-expenses/${id}`, {
      method: "PATCH",
      headers: createJsonHeaders(token),
      body: JSON.stringify(fixedExpense),
      next: { tags: ["fixed-expense"] },
    });

    if (!response.ok)
      throw await createApiError(response, {
        context: `PATCH /fixed-expenses/${id}`,
        fallback: "Não foi possível atualizar a despesa fixa.",
      });

    const data: FixedExpense = await response.json();
    return data;
  } catch (error) {
    throw createRequestError(error, {
      context: `PATCH /fixed-expenses/${id}`,
      fallback: "Não foi possível atualizar a despesa fixa.",
    });
  }
}

export async function deleteFixedExpense(
  id: string | undefined,
): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const response = await backendFetch(`${backendUrl}/fixed-expenses/${id}`, {
      method: "DELETE",
      headers: createJsonHeaders(token),
    });

    if (!response.ok)
      throw await createApiError(response, {
        context: `DELETE /fixed-expenses/${id}`,
        fallback: "Não foi possível excluir a despesa fixa.",
      });

    return true;
  } catch (error) {
    throw createRequestError(error, {
      context: `DELETE /fixed-expenses/${id}`,
      fallback: "Não foi possível excluir a despesa fixa.",
    });
  }
}

export async function markFixedExpenseAsPaid(
  id: string,
  isPaid: boolean,
): Promise<FixedExpensePaymentResult> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  const response = await backendFetch(`${backendUrl}/fixed-expenses/${id}/payment`, {
    method: "PATCH",
    headers: createJsonHeaders(token),
    body: JSON.stringify({
      isPaid,
    }),
  });

  if (!response.ok)
    throw await createApiError(response, {
      context: `PATCH /fixed-expenses/${id}/payment`,
      fallback:
        response.status === 409
          ? "Esta despesa já foi paga neste ciclo."
          : "Não foi possível atualizar o pagamento da despesa fixa.",
    });

  const data = await response.json();
  return normalizePaymentResult(data);
}

function normalizePaymentResult(data: unknown): FixedExpensePaymentResult {
  const payload = data as {
    fixedExpense?: FixedExpense;
    expense?: FixedExpense;
    transaction?: FixedExpensePaymentResult["transaction"];
  } & FixedExpense;

  const fixedExpense = payload.fixedExpense ?? payload.expense ?? payload;

  return {
    fixedExpense,
    transaction: payload.transaction ?? fixedExpense.paidTransaction ?? null,
  };
}
