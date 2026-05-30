"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";

import { updateTransaction } from "@/services/transactions.service";

export async function updateTransactionAction(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    throw new Error("ID da transação não fornecido");
  }

  const transactionData = {
    value: parseFloat(formData.get("value") as string),
    date: formData.get("date") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    type: formData.get("type") as "EXPENSE" | "INCOME",
  };

  const updated = await updateTransaction(id, transactionData);

  if (!updated) {
    throw new Error("Falha ao atualizar transação");
  }

  revalidateTag("transactions");
  revalidateTag("dashboard");
  revalidateTag("monthlyComparison");
  redirect("/transactions");
}
