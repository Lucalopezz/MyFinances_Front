"use server";

import { revalidatePath } from "next/cache";

import { NewWish } from "@/interfaces/wishlist.interface";
import { createWish } from "@/actions/wishlist/wishlist";

export async function createWishAction(data: NewWish) {
  const success = await createWish(data);

  if (success) {
    revalidatePath("/wishlist");
  }
}
