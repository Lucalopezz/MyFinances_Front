"use server";

import { revalidatePath } from "next/cache";

export async function deleteWishItemAction(formData: FormData) {
  const id = formData.get("id") as string;
  
  try {

    revalidatePath("/wishlist");
    
  } catch (error) {
    console.error("Erro ao deletar item da lista de desejos:", error);
    return { success: false, error: "Falha ao deletar o item" };
  }
}