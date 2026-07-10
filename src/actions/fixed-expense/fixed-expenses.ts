"use server";

import type {
  FixedExpense,
  FixedExpensePaymentResult,
} from "@/models/fixed-expense.model";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import { unstable_noStore as noStore } from "next/cache";

export async function createFixedExpense(
  fixedExpense: Omit<FixedExpense, "id">,
): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    throw new Error("Não autorizado - sessão não encontrada");
  }

  try {
    const response = await fetch(`${backendUrl}/fixed-expenses`, {
      method: "POST",
      headers: createJsonHeaders(token),
      body: JSON.stringify(fixedExpense),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      }

      const message = await readApiErrorMessage(
        response,
        `Falha ao criar despesa fixa: ${response.statusText}`,
      );
      throw new Error(message);
    }

    return true;
  } catch (error) {
    console.error("Erro ao criar despesa fixa:", error);
    throw error;
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
    throw new Error("Não autorizado - sessão não encontrada");
  }

  try {
    const response = await fetch(`${backendUrl}/fixed-expenses/${id}`, {
      method: "PATCH",
      headers: createJsonHeaders(token),
      body: JSON.stringify(fixedExpense),
      next: { tags: ["fixed-expense"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Despesa fixa não encontrada");
      }

      const message = await readApiErrorMessage(
        response,
        `Falha ao atualizar despesa fixa: ${response.statusText}`,
      );
      throw new Error(message);
    }

    const data: FixedExpense = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar despesa fixa:", error);
    throw error;
  }
}

export async function deleteFixedExpense(
  id: string | undefined,
): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    console.error("Não autorizado - sessão não encontrada");
    return false;
  }

  try {
    const response = await fetch(`${backendUrl}/fixed-expenses/${id}`, {
      method: "DELETE",
      headers: createJsonHeaders(token),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Despesa fixa não encontrada");
      }
      throw new Error(`Falha ao deletar despesa fixa: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar despesa fixa:", error);
    return false;
  }
}

export async function markFixedExpenseAsPaid(
  id: string,
  isPaid: boolean,
): Promise<FixedExpensePaymentResult> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    throw new Error("Não autorizado - sessão não encontrada");
  }

  const response = await fetch(`${backendUrl}/fixed-expenses/${id}/payment`, {
    method: "PATCH",
    headers: createJsonHeaders(token),
    body: JSON.stringify({
      isPaid,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.error("Não autorizado - token inválido ou expirado");
    } else if (response.status === 404) {
      console.error("Despesa fixa não encontrada");
    }

    const fallback =
      response.status === 409
        ? "A API impediu a criação de uma transação duplicada para esta despesa fixa neste ciclo."
        : `Falha ao atualizar pagamento da despesa fixa: ${response.statusText}`;
    const message = await readApiErrorMessage(response, fallback);
    throw new Error(message);
  }

  const data = await response.json();
  return normalizePaymentResult(data);
}

async function readApiErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return (
      data?.message ||
      data?.error ||
      data?.details ||
      fallback
    );
  } catch {
    return fallback;
  }
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
