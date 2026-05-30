"use server";

import { cookies } from "next/headers";

import {
  AUTH_COOKIE_NAME,
  createJsonHeaders,
  getServerBackendUrl,
} from "@/lib/backend";

type LoginPayload =
  | FormData
  | {
      email: string;
      password: string;
    };

function isFormData(payload: LoginPayload): payload is FormData {
  return typeof (payload as FormData).get === "function";
}

function getLoginField(payload: LoginPayload, field: "email" | "password") {
  if (isFormData(payload)) {
    return String((payload as FormData).get(field) ?? "");
  }

  return String(payload[field] ?? "");
}

export async function loginAction(payload: LoginPayload) {
  const email = getLoginField(payload, "email");
  const password = getLoginField(payload, "password");
  const backendUrl = getServerBackendUrl();

  const response = await fetch(`${backendUrl}/auth`, {
    method: "POST",
    headers: createJsonHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok || !data?.accessToken) {
    throw new Error(data?.message ?? "Credenciais inválidas");
  }

  (await cookies()).set({
    name: AUTH_COOKIE_NAME,
    value: data.accessToken,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return { ok: true };
}
