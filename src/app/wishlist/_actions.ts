"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createWish, deleteWish, updateWish } from "./_services";
import { NewWish } from "@/interfaces/wishlist.interface";
import { redirect } from "next/navigation";



export async function deleteFixedExpenseAction(id: string) {
  const success = await deleteWish(id);
  if (success) {
    revalidatePath("/wishlist");
  }
}

export async function createWishAction(data:NewWish) {
  const success = await createWish(data)
  if (success) {
    revalidatePath("/wishlist");
  }
}

export async function updateWishAction(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    console.error("ID do item de desejo não fornecido");
    throw new Error("ID do item de desejo não fornecido");
  }

  try {
    const wishData = {
      name: formData.get("name") as string,
      desiredValue: parseFloat(formData.get("desiredValue") as string),
      targetDate: formData.get("targetDate") as string,
      savedAmount: parseFloat(formData.get("savedAmount") as string),
    };

    const updated = await updateWish(id, wishData);

    if (!updated) {
      throw new Error("Falha ao atualizar item de desejo");
    }

    revalidateTag("wishlist");
    revalidatePath("/wishlist");
    redirect("/wishlist");
  } catch (error) {
    console.error("Error in updateWishAction:", error);
    throw error;
  }
}