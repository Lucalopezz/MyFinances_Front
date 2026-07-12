"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";

import { updateTransaction } from "@/actions/transaction/transactions";
import type { Transaction } from "@/models/transaction.model";

type UpdateTransactionPayload =
  | FormData
  | {
      id: string;
      transaction: Transaction;
    };

function isFormData(payload: UpdateTransactionPayload): payload is FormData {
  return typeof (payload as FormData).get === "function";
}

export async function updateTransactionAction(payload: UpdateTransactionPayload) {
  const id = isFormData(payload) ? (payload.get("id") as string) : payload.id;

  if (!id) {
    throw new Error("ID da transação não fornecido");
  }

  const transactionData = isFormData(payload)
    ? {
        value: parseFloat(payload.get("value") as string),
        date: payload.get("date") as string,
        description: payload.get("description") as string,
        category: payload.get("category") as string,
        type: payload.get("type") as Transaction["type"],
      }
    : payload.transaction;

  const updated = await updateTransaction(id, transactionData);

  if (!updated) {
    throw new Error("Falha ao atualizar transação");
  }

  revalidateTag("transactions");
  revalidateTag("dashboard");
  revalidateTag("monthlyComparison");
  revalidateTag("sixMonthComparison");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/comparative");

  if (isFormData(payload)) {
    redirect("/transactions");
  }

  return updated;
}
