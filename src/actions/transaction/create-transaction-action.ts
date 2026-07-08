"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { createTransaction } from "@/actions/transaction/transactions";
import type { Transaction } from "@/models/transaction.model";

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
