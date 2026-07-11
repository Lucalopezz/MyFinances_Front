"use server";

import { createUser } from "@/actions/user/user";

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
