"use server";

import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/backend";

export async function logoutAction() {
  (await cookies()).set({
    name: AUTH_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });
  return { ok: true };
}
