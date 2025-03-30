import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Transaction } from "@/components/dashboard/TransactionDialog";
import toast from "react-hot-toast";

export async function getTransactions(): Promise<Transaction[]> {
  const session = await getServerSession(authOptions);

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/transactions`, {
      headers: {
        Authorization: `Bearer ${session?.jwt}`,
        "Content-Type": "application/json",
      },
      next: { tags: ["transactions"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - sessão expirada");
      }
      throw new Error("Falha ao buscar transações");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro:", error);
    return [];
  }
}
export async function getTransaction(id: string): Promise<Transaction | null> {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    console.error("Não autorizado - sessão não encontrada");
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/transactions/${id}`,
      {
        headers: {
          Authorization: `Bearer ${session.jwt}`,
          "Content-Type": "application/json",
        },
        next: { tags: ["transaction"] },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Transação não encontrada");
      }
      throw new Error(`Falha ao buscar transação: ${response.statusText}`);
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
  transaction: Omit<Transaction, "id">
): Promise<Transaction | null> {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    console.error("Não autorizado - sessão não encontrada");
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/transactions/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
        next: { tags: ["transaction"] },
      }
    );

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
