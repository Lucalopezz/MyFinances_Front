"use server";

import { revalidatePath } from "next/cache";
import { deleteWish } from "./_services";


export async function deleteFixedExpenseAction(id: string) {
  const success = await deleteWish(id);
  if (success) {
    revalidatePath("/wishlist");
  }
}
