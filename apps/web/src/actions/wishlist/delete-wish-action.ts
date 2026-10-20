"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { deleteWish } from "@/actions/wishlist/wishlist";

export async function deleteWishAction(id: string | undefined) {
  const success = await deleteWish(id);

  if (!success) {
    throw new Error("Falha ao excluir item de desejo");
  }

  revalidateTag("wishlist");
  revalidatePath("/wishlist");
}
