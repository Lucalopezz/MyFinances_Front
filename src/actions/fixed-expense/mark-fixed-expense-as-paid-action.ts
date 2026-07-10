"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { markFixedExpenseAsPaid } from "@/actions/fixed-expense/fixed-expenses";

type MarkFixedExpenseAsPaidPayload =
  | FormData
  | {
      id: string;
      isPaid: boolean;
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
  const isPaid = isFormData(payload)
    ? payload.get("isPaid") === "true"
    : payload.isPaid;

  if (!id) {
    throw new Error("ID da despesa fixa não fornecido");
  }

  const result = await markFixedExpenseAsPaid(id, isPaid);

  revalidateTag("fixed-expenses");
  revalidateTag("fixed-expense");
  revalidateTag("transactions");
  revalidateTag("transaction");
  revalidateTag("dashboard");
  revalidateTag("monthlyComparison");
  revalidateTag("sixMonthComparison");
  revalidatePath("/fixed-expenses");
  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/comparative");

  return result;
}
