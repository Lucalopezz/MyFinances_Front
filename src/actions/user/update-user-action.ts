"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { updateUser } from "@/services/config.service";
import { UpdateUserInput } from "@/interfaces/user.interface";

export async function updateUserAction(formData: UpdateUserInput) {
  const payload: Partial<{ name: string; password: string }> = {};

  if (formData.name?.trim()) {
    payload.name = formData.name.trim();
  }

  if (formData.password?.trim()) {
    payload.password = formData.password;
  }

  const updated = await updateUser(payload);

  if (!updated) {
    throw new Error("Falha ao atualizar usuário");
  }

  revalidateTag("get-user");
  revalidatePath("/config");
}
