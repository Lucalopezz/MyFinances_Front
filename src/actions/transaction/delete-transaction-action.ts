"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { deleteTransaction } from "@/services/transactions.service";

export async function deleteTransactionAction(id: string) {
  const success = await deleteTransaction(id);

  if (!success) {
    throw new Error("Falha ao excluir transação");
  }

  revalidateTag("transactions");
  revalidateTag("dashboard");
  revalidateTag("monthlyComparison");
  revalidatePath("/transactions");
}
