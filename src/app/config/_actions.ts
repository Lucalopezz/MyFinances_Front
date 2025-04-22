"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { updateUser } from "./_services";
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
