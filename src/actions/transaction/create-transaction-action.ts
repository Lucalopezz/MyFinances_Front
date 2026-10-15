"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { createTransaction } from "@/actions/transaction/transactions";
import type { Transaction } from "@/models/transaction.model";
import { createCardPurchase } from "@/actions/cards/cards";

/** Direciona o formulário para lançamento realizado ou compra no cartão e revalida as telas. */
export async function createTransactionAction(transaction: Transaction) {
  if (
    transaction.type === "EXPENSE" &&
    transaction.paymentMethod === "CREDIT"
  ) {
    // A compra compromete as faturas; a despesa realizada só nasce no pagamento.
    // createCardPurchase já revalida o domínio de cartões e as telas financeiras.
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

  // O lançamento afeta lista, indicadores, orçamento e projeções no servidor.
  // Os hooks de mutação invalidam separadamente o cache React Query no navegador.
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
