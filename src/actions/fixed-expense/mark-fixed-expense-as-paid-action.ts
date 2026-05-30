"use server";

import { revalidatePath } from "next/cache";

import { markFixedExpenseAsPaid } from "@/services/fixed-expenses.service";

export async function markFixedExpenseAsPaidAction(formData: FormData) {
  const id = formData.get("id") as string;
  const dueDate = formData.get("dueDate") as string;
  const success = await markFixedExpenseAsPaid(id, dueDate);

  if (success) {
    revalidatePath("/fixed-expenses");
  }
}
