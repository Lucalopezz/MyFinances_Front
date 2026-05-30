"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { createFixedExpense as createFixedExpenseService } from "@/services/fixed-expenses.service";
import { FixedExpense } from "@/interfaces/fixed-expense.interface";

export async function createFixedExpenseAction(data: Omit<FixedExpense, "id">) {
  const success = await createFixedExpenseService(data);

  if (!success) {
    throw new Error("Falha ao criar despesa fixa");
  }

  revalidateTag("fixed-expenses");
  revalidatePath("/fixed-expenses");
}
