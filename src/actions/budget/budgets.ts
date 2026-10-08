"use server";

// Transporte compartilhado de orçamentos: GET/HEAD têm prazo e repetição
// limitada em falhas transitórias; gravações continuam com envio único. URL,
// cookie e Authorization são tratados no servidor pelos consumidores abaixo.
// A política completa fica em backend-fetch.ts, sem duplicar timers neste domínio.
import { backendFetch } from "@/lib/backend-fetch";

import { revalidatePath, revalidateTag, unstable_noStore as noStore } from "next/cache";

import { createApiError, createRequestError } from "@/lib/api-error";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import type { BudgetInput, MonthlyBudget, MonthlyBudgetSummary } from "@/models/budget.model";
import { budgetSchema } from "@/schemas/budget.schema";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

async function authenticatedRequest(path: string, init: RequestInit = {}) {
  const token = await getServerToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
  return backendFetch(`${getServerBackendUrl()}${path}`, {
    ...init,
    headers: createJsonHeaders(token),
    cache: "no-store",
  });
}

function revalidateBudgetViews() {
  revalidateTag("budgets");
  revalidateTag("dashboard");
  revalidatePath("/dashboard");
}

export async function getBudgetSummary(month: string): Promise<MonthlyBudgetSummary[] | null> {
  noStore();
  if (!MONTH_PATTERN.test(month)) throw new Error("Selecione um mês válido.");

  try {
    const response = await authenticatedRequest(`/budgets/summary?month=${month}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      throw await createApiError(response, {
        context: "GET /budgets/summary",
        fallback: "Não foi possível carregar os orçamentos.",
      });
    }
    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) throw new Error("Resposta de orçamento inválida.");
    return payload as MonthlyBudgetSummary[];
  } catch (error) {
    throw createRequestError(error, {
      context: "GET /budgets/summary",
      fallback: "Não foi possível carregar os orçamentos.",
    });
  }
}

export async function createBudget(input: BudgetInput): Promise<MonthlyBudget> {
  const data = budgetSchema.parse(input);
  try {
    const response = await authenticatedRequest("/budgets", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw await createApiError(response, {
        context: "POST /budgets",
        fallback: "Não foi possível criar o orçamento.",
      });
    }
    const budget = (await response.json()) as MonthlyBudget;
    revalidateBudgetViews();
    return budget;
  } catch (error) {
    throw createRequestError(error, {
      context: "POST /budgets",
      fallback: "Não foi possível criar o orçamento.",
    });
  }
}

export async function updateBudget(id: string, input: BudgetInput): Promise<MonthlyBudget> {
  const data = budgetSchema.parse(input);
  try {
    const response = await authenticatedRequest(`/budgets/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw await createApiError(response, {
        context: "PATCH /budgets/:id",
        fallback: "Não foi possível atualizar o orçamento.",
      });
    }
    const budget = (await response.json()) as MonthlyBudget;
    revalidateBudgetViews();
    return budget;
  } catch (error) {
    throw createRequestError(error, {
      context: "PATCH /budgets/:id",
      fallback: "Não foi possível atualizar o orçamento.",
    });
  }
}

export async function deleteBudget(id: string): Promise<void> {
  try {
    const response = await authenticatedRequest(`/budgets/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw await createApiError(response, {
        context: "DELETE /budgets/:id",
        fallback: "Não foi possível excluir o orçamento.",
      });
    }
    revalidateBudgetViews();
  } catch (error) {
    throw createRequestError(error, {
      context: "DELETE /budgets/:id",
      fallback: "Não foi possível excluir o orçamento.",
    });
  }
}
