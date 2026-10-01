"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { createTransaction } from "@/actions/transaction/transactions";
import type { Transaction } from "@/models/transaction.model";
import { createCardPurchase } from "@/actions/cards/cards";

export async function createTransactionAction(transaction: Transaction) {
  if (
    transaction.type === "EXPENSE" &&
    transaction.paymentMethod === "CREDIT"
  ) {
    if (!transaction.cardId) throw new Error("Selecione um cartão.");
    const purchase = await createCardPurchase(transaction.cardId, {
      description: transaction.description,
      amount: transaction.value,
      date: transaction.date,
      category: transaction.category,
      installments: transaction.installments ?? 1,
    });
    return { ...transaction, id: purchase.id };
  }
  const created = await createTransaction(transaction);

  if (!created) {
    throw new Error("Falha ao criar transação");
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

  return created;
}
