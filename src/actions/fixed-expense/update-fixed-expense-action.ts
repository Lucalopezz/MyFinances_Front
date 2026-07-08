"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";

import { updateFixedExpense } from "@/actions/fixed-expense/fixed-expenses";

export async function updateFixedExpenseAction(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    console.error("ID da despesa fixa não fornecido");
    throw new Error("ID da despesa fixa não fornecido");
  }

  try {
    const fixedExpenseData = {
      name: formData.get("name") as string,
      amount: parseFloat(formData.get("amount") as string),
      dueDate: formData.get("dueDate") as string,
      recurrence: formData.get("recurrence") as string,
      isPaid: formData.get("isPaid") === "on",
    };

    const updated = await updateFixedExpense(id, fixedExpenseData);

    if (!updated) {
      throw new Error("Falha ao atualizar despesa fixa");
    }

    revalidateTag("fixed-expenses");
    revalidatePath("/fixed-expenses");
    redirect("/fixed-expenses");
  } catch (error) {
    console.error("Error in updateFixedExpenseAction:", error);
    throw error;
  }
}
