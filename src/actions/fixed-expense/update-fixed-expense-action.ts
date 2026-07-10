"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";

import { updateFixedExpense } from "@/actions/fixed-expense/fixed-expenses";
import type { FixedExpenseCategory } from "@/constants/transaction-categories";
import type { FixedExpense } from "@/models/fixed-expense.model";

type UpdateFixedExpensePayload =
  | FormData
  | {
      id: string;
      fixedExpense: Omit<FixedExpense, "id">;
    };

function isFormData(payload: UpdateFixedExpensePayload): payload is FormData {
  return typeof (payload as FormData).get === "function";
}

export async function updateFixedExpenseAction(
  payload: UpdateFixedExpensePayload,
) {
  const id = isFormData(payload) ? (payload.get("id") as string) : payload.id;

  if (!id) {
    console.error("ID da despesa fixa não fornecido");
    throw new Error("ID da despesa fixa não fornecido");
  }

  try {
    const fixedExpenseData = isFormData(payload)
      ? {
          name: payload.get("name") as string,
          amount: parseFloat(payload.get("amount") as string),
          category: payload.get("category") as FixedExpenseCategory,
          dueDate: payload.get("dueDate") as string,
          recurrence: payload.get("recurrence") as string,
        }
      : payload.fixedExpense;

    const updated = await updateFixedExpense(id, fixedExpenseData);

    revalidateTag("fixed-expenses");
    revalidatePath("/fixed-expenses");

    if (isFormData(payload)) {
      redirect("/fixed-expenses");
    }

    return updated;
  } catch (error) {
    throw error;
  }
}