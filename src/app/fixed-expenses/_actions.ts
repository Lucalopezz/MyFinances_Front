"use server";

import { revalidatePath } from "next/cache";
import { FixedExpense } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { deleteFixedExpense, markFixedExpenseAsPaid } from "./_services";

export async function createFixedExpense(data: Omit<FixedExpense, "id">): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    console.error("Não autorizado - sessão não encontrada");
    return false;
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/fixed-expenses`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      }
      throw new Error(`Falha ao criar despesa fixa: ${response.statusText}`);
    }

    revalidatePath("/fixed-expenses");
    return true;
  } catch (error) {
    console.error("Erro ao criar despesa fixa:", error);
    return false;
  }
}



export async function markAsPaidAction(formData: FormData) {
  const id = formData.get("id") as string;
  const dueDate = formData.get("dueDate") as string;
  const success = await markFixedExpenseAsPaid(id, dueDate);
  if (success) {
    revalidatePath("/fixed-expenses");
  }
}

export async function deleteAction(id: string) {
  const success = await deleteFixedExpense(id);
  if (success) {
    revalidatePath("/fixed-expenses");
  }
}