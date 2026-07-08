"use server";

import { revalidatePath } from "next/cache";

import { deleteFixedExpense } from "@/actions/fixed-expense/fixed-expenses";

export async function deleteFixedExpenseAction(id: string | undefined) {
  const success = await deleteFixedExpense(id);

  if (success) {
    revalidatePath("/fixed-expenses");
  }
}
