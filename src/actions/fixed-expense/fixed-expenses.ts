"use server";

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
    const response = await fetch(`${backendUrl}/fixed-expenses`, {
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

export async function getFixedExpenses(): Promise<FixedExpense[]> {
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${backendUrl}/fixed-expenses`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["fixed-expenses"] },
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
    const response = await fetch(`${backendUrl}/fixed-expenses/${id}`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["fixed-expense"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Despesa fixa não encontrada");
      }
      return null;
    }

    const data: FixedExpense = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar despesa fixa:", error);
    return null;
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
    const response = await fetch(`${backendUrl}/fixed-expenses/${id}`, {
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
    const response = await fetch(`${backendUrl}/fixed-expenses/${id}`, {
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

  const response = await fetch(`${backendUrl}/fixed-expenses/${id}/payment`, {
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
