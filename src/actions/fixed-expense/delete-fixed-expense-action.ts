"use server";

import { revalidatePath } from "next/cache";

import { deleteFixedExpense } from "@/services/fixed-expenses.service";

export async function deleteFixedExpenseAction(id: string | undefined) {
  const success = await deleteFixedExpense(id);

  if (success) {
    revalidatePath("/fixed-expenses");
  }
}
