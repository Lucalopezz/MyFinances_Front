"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { createTransaction } from "@/services/transactions.service";

export async function createTransactionAction(transaction: {
  value: number;
  date: string;
  description: string;
  category: string;
  type: "EXPENSE" | "INCOME";
}) {
  const created = await createTransaction(transaction);

  if (!created) {
    throw new Error("Falha ao criar transação");
  }

  revalidateTag("transactions");
  revalidateTag("dashboard");
  revalidateTag("monthlyComparison");
  revalidatePath("/transactions");

  return created;
}
