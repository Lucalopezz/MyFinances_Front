"use server";

import { revalidatePath } from "next/cache";
import { createWish, deleteWish } from "./_services";
import { NewWish } from "@/interfaces/wishlist.interface";


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