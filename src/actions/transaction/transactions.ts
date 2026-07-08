import type { Transaction } from "@/models/transaction.model";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import { unstable_noStore as noStore } from "next/cache";

export async function createTransaction(
  transaction: Omit<Transaction, "id">,
): Promise<Transaction | null> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    console.error("Não autorizado - sessão não encontrada");
    return null;
  }

  try {
    const response = await fetch(`${backendUrl}/transactions`, {
      method: "POST",
      headers: createJsonHeaders(token),
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      }
      throw new Error(`Falha ao criar transação: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return null;
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

  if (!token) {
    console.error("Não autorizado - sessão não encontrada");
    return null;
  }

  try {
    const response = await fetch(`${backendUrl}/transactions/${id}`, {
      method: "PATCH",
      headers: createJsonHeaders(token),
      body: JSON.stringify(transaction),
      next: { tags: ["transaction"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Transação não encontrada");
      }
      throw new Error(`Falha ao atualizar transação: ${response.statusText}`);
    }

    const data: Transaction = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    return null;
  }
}

export async function deleteTransaction(
  id: string | undefined,
): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    console.error("Não autorizado - sessão não encontrada");
    return false;
  }

  try {
    const response = await fetch(`${backendUrl}/transactions/${id}`, {
      method: "DELETE",
      headers: createJsonHeaders(token),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Transação não encontrada");
      }
      throw new Error(`Falha ao deletar transação: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    return false;
  }
}
