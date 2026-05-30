"use server";

import { revalidatePath } from "next/cache";

import { deleteWish } from "@/services/wishlist.service";

export async function deleteWishAction(id: string | undefined) {
  const success = await deleteWish(id);

  if (success) {
    revalidatePath("/wishlist");
  }
}
