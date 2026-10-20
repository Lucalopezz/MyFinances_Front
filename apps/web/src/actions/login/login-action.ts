"use server";

// Transporte compartilhado de login: GET/HEAD têm prazo e repetição
// limitada em falhas transitórias; gravações continuam com envio único. URL,
// cookie e Authorization são tratados no servidor pelos consumidores abaixo.
// A política completa fica em backend-fetch.ts, sem duplicar timers neste domínio.
import { backendFetch } from "@/lib/backend-fetch";

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

type LoginResult = { ok: true } | { ok: false; message: string };

function isFormData(payload: LoginPayload): payload is FormData {
  return typeof (payload as FormData).get === "function";
}

function getLoginField(payload: LoginPayload, field: "email" | "password") {
  if (isFormData(payload)) {
    return String((payload as FormData).get(field) ?? "");
  }

  return String(payload[field] ?? "");
}

export async function loginAction(payload: LoginPayload): Promise<LoginResult> {
  const email = getLoginField(payload, "email");
  const password = getLoginField(payload, "password");

  let response: Response;
  try {
    const backendUrl = getServerBackendUrl();
    response = await backendFetch(`${backendUrl}/auth`, {
      method: "POST",
      headers: createJsonHeaders(),
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    const publicError = createRequestError(error, {
      context: "POST /auth",
      fallback: "Não foi possível entrar agora. Tente novamente.",
    });
    return { ok: false, message: publicError.message };
  }

  if (!response.ok) {
    const publicError = await createApiError(response, {
      context: "POST /auth",
      fallback:
        response.status >= 500
          ? "Não foi possível entrar agora. Tente novamente."
          : "E-mail ou senha inválidos.",
    });
    return { ok: false, message: publicError.message };
  }

  const data = await response.json();

  if (!data?.accessToken) {
    console.error("[API] POST /auth returned a response without accessToken");
    return { ok: false, message: "Não foi possível entrar agora. Tente novamente." };
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
