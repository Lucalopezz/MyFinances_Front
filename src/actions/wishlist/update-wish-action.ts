"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";

import { updateWish } from "@/services/wishlist.service";

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
