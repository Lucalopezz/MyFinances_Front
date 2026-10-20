"use server";

import { revalidateTag } from "next/cache";

export async function revalidateTransactionsCache() {
  revalidateTag("transactions");
  return { revalidated: true };
}
