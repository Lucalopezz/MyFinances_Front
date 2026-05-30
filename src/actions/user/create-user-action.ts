"use server";

import { createUser } from "@/services/config.service";

export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
}) {
  const created = await createUser(data);

  if (!created) {
    throw new Error("Falha ao criar usuário");
  }

  return created;
}
