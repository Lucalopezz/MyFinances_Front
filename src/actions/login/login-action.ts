"use server";

import { cookies } from "next/headers";

import {
  AUTH_COOKIE_NAME,
  createJsonHeaders,
  getServerBackendUrl,
} from "@/lib/backend";
import { createApiError, createRequestError } from "@/lib/api-error";

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

  let response: Response;
  try {
    response = await fetch(`${backendUrl}/auth`, {
      method: "POST",
      headers: createJsonHeaders(),
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    throw createRequestError(error, {
      context: "POST /auth",
      fallback: "Não foi possível entrar agora. Tente novamente.",
    });
  }

  if (!response.ok) {
    throw await createApiError(response, {
      context: "POST /auth",
      fallback: "E-mail ou senha inválidos.",
    });
  }

  const data = await response.json();

  if (!data?.accessToken) {
    console.error("[API] POST /auth returned a response without accessToken");
    throw new Error("Não foi possível entrar agora. Tente novamente.");
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
