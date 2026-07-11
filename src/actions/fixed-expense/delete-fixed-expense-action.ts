"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { deleteFixedExpense } from "@/actions/fixed-expense/fixed-expenses";

export async function deleteFixedExpenseAction(id: string | undefined) {
  const success = await deleteFixedExpense(id);

  if (!success) {
    throw new Error("Falha ao excluir despesa fixa");
  }

  revalidateTag("fixed-expenses");
  revalidatePath("/fixed-expenses");
}
