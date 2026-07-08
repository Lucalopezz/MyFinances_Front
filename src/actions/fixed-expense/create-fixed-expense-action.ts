"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { createFixedExpense as createFixedExpenseService } from "@/actions/fixed-expense/fixed-expenses";
import { FixedExpense } from "@/models/fixed-expense.model";

export async function createFixedExpenseAction(data: Omit<FixedExpense, "id">) {
  const success = await createFixedExpenseService(data);

  if (!success) {
    throw new Error("Falha ao criar despesa fixa");
  }

  revalidateTag("fixed-expenses");
  revalidatePath("/fixed-expenses");
}
