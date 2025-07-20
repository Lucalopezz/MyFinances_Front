import { getServerSession } from "next-auth";

import { FixedExpense } from "./types";
import { authOptions } from "../api/auth/[...nextauth]/route";


export async function getFixedExpenses(): Promise<FixedExpense[]> {
  const session = await getServerSession(authOptions);

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/fixed-expenses`, {
      headers: {
        Authorization: `Bearer ${session?.jwt}`,
        "Content-Type": "application/json",
      },
      next: { tags: ["fixed-expenses"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - sessão expirada");
      }
      throw new Error("Falha ao buscar despesas fixas");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro:", error);
    return [];
  }
}

export async function getFixedExpense(id: string): Promise<FixedExpense | null> {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    console.error("Não autorizado - sessão não encontrada");
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/fixed-expenses/${id}`,
      {
        headers: {
          Authorization: `Bearer ${session.jwt}`,
          "Content-Type": "application/json",
        },
        next: { tags: ["fixed-expense"] },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Despesa fixa não encontrada");
      }
      throw new Error(`Falha ao buscar despesa fixa: ${response.statusText}`);
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
  fixedExpense: Omit<FixedExpense, "id">
): Promise<FixedExpense | null> {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    console.error("Não autorizado - sessão não encontrada");
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/fixed-expenses/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fixedExpense),
        next: { tags: ["fixed-expense"] },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Despesa fixa não encontrada");
      }
      throw new Error(`Falha ao atualizar despesa fixa: ${response.statusText}`);
    }

    const data: FixedExpense = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar despesa fixa:", error);
    return null;
  }
}

export async function deleteFixedExpense(id: string | undefined): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    console.error("Não autorizado - sessão não encontrada");
    return false;
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/fixed-expenses/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.jwt}`,
          "Content-Type": "application/json",
        },
      }
    );

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

export async function markFixedExpenseAsPaid(id: string, currentDueDate: string): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    console.error("Não autorizado - sessão não encontrada");
    return false;
  }

  try {
    // Calcular a data do próximo mês mantendo o mesmo dia
    const currentDate = new Date(currentDueDate);
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const updateData = {
      isPaid: true,
      dueDate: nextMonth.toISOString()
    };

    const response = await fetch(
      `${process.env.BACKEND_URL}/fixed-expenses/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Despesa fixa não encontrada");
      }
      throw new Error(`Falha ao marcar despesa como paga: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao marcar despesa como paga:", error);
    return false;
  }
}