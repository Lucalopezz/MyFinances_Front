"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { markFixedExpenseAsPaid } from "@/actions/fixed-expense/fixed-expenses";

type MarkFixedExpenseAsPaidPayload =
  | FormData
  | {
      id: string;
      dueDate: string;
    };

function isFormData(
  payload: MarkFixedExpenseAsPaidPayload,
): payload is FormData {
  return typeof (payload as FormData).get === "function";
}

export async function markFixedExpenseAsPaidAction(
  payload: MarkFixedExpenseAsPaidPayload,
) {
  const id = isFormData(payload) ? (payload.get("id") as string) : payload.id;
  const dueDate = isFormData(payload)
    ? (payload.get("dueDate") as string)
    : payload.dueDate;
  const success = await markFixedExpenseAsPaid(id, dueDate);

  if (!success) {
    throw new Error("Falha ao marcar despesa como paga");
  }

  revalidateTag("fixed-expenses");
  revalidateTag("transactions");
  revalidateTag("dashboard");
  revalidateTag("monthlyComparison");
  revalidateTag("sixMonthComparison");
  revalidatePath("/fixed-expenses");
  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/comparative");

  return true;
}
