"use server";

import { revalidatePath } from "next/cache";
import { FixedExpense } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import {
  deleteFixedExpense,
  markFixedExpenseAsPaid,
  updateFixedExpense,
} from "./_services";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";

export async function createFixedExpense(
  data: Omit<FixedExpense, "id">
): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    console.error("Não autorizado - sessão não encontrada");
    return false;
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/fixed-expenses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

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

export async function deleteFixedExpenseAction(id: string) {
  const success = await deleteFixedExpense(id);
  if (success) {
    revalidatePath("/fixed-expenses");
  }
}

export async function revalidateTransactionsCache() {
  revalidateTag("transactions");
  return { revalidated: true };
}

export async function updateFixedExpenseAction(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    console.error("ID da despesa fixa não fornecido");
    throw new Error("ID da despesa fixa não fornecido");
  }

  try {
    const fixedExpenseData = {
      name: formData.get("name") as string,
      amount: parseFloat(formData.get("amount") as string),
      dueDate: formData.get("dueDate") as string,
      recurrence: formData.get("recurrence") as string,
      isPaid: formData.get("isPaid") === "on",
    };

    const updated = await updateFixedExpense(id, fixedExpenseData);

    if (!updated) {
      throw new Error("Falha ao atualizar despesa fixa");
    }

    revalidateTag("fixed-expenses");
    revalidatePath("/fixed-expenses");
    redirect("/fixed-expenses");
  } catch (error) {
    console.error("Error in updateFixedExpenseAction:", error);
    throw error;
  }
}
