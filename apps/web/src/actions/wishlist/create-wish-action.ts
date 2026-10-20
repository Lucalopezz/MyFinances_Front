"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { NewWish } from "@/models/wishlist.model";
import { createWish } from "@/actions/wishlist/wishlist";

export async function createWishAction(data: NewWish) {
  const success = await createWish(data);

  if (!success) {
    throw new Error("Falha ao criar item de desejo");
  }

  revalidateTag("wishlist");
  revalidatePath("/wishlist");
}
