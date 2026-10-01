"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { deleteTransaction } from "@/actions/transaction/transactions";

export async function deleteTransactionAction(id: string) {
  const success = await deleteTransaction(id);

  if (!success) {
    throw new Error("Falha ao excluir transação");
  }

  revalidateTag("transactions");
  revalidateTag("dashboard");
  revalidateTag("budgets");
  revalidateTag("monthlyComparison");
  revalidateTag("sixMonthComparison");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidateTag("calendar");
  revalidatePath("/comparative");
}
