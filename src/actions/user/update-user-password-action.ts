"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { updateUser } from "@/services/config.service";

export async function updateUserPasswordAction(data: { password: string }) {
  const updated = await updateUser({ password: data.password } as never);

  if (!updated) {
    throw new Error("Falha ao atualizar senha do usuário");
  }

  revalidateTag("get-user");
  revalidatePath("/config");
}
