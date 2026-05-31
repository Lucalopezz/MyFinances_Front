"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { createTransaction } from "@/services/transactions.service";
import type { Transaction } from "@/components/transaction/transaction.types";

export async function createTransactionAction(transaction: Transaction) {
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
