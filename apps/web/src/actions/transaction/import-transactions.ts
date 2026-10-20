"use server";

// Transporte compartilhado de importação de extratos: GET/HEAD têm prazo e repetição
// limitada em falhas transitórias; gravações continuam com envio único. URL,
// cookie e Authorization são tratados no servidor pelos consumidores abaixo.
// A política completa fica em backend-fetch.ts, sem duplicar timers neste domínio.
import { backendFetch } from "@/lib/backend-fetch";

import {
  revalidatePath,
  revalidateTag,
  unstable_noStore as noStore,
} from "next/cache";
import { getServerToken } from "@/lib/serverAuth";
import { getServerBackendUrl, createJsonHeaders } from "@/lib/backend";
import { createApiError, createRequestError } from "@/lib/api-error";
import {
  importOptionsSchema,
  confirmImportSchema,
  IMPORT_MAX_BYTES,
} from "@/schemas/transaction-import.schema";
import type {
  ImportActionResult,
  ImportChoice,
  ImportPreview,
  ImportResult,
} from "@/models/transaction-import.model";

async function send<T>(
  path: string,
  method: string,
  body?: FormData | unknown,
): Promise<ImportActionResult<T>> {
  noStore();
  const token = await getServerToken();
  if (!token)
    return {
      ok: false,
      status: 401,
      error: "Sua sessão expirou. Entre novamente.",
    };
  const context = `${method} /transaction-imports`;
  const fallback =
    "Não foi possível concluir a importação. Consulte o resultado e tente novamente.";
  try {
    const multipart = body instanceof FormData;
    const response = await backendFetch(
      `${getServerBackendUrl()}/transaction-imports${path}`,
      {
        method,
        cache: "no-store",
        headers: multipart
          ? { Authorization: `Bearer ${token}` }
          : createJsonHeaders(token),
        ...(body !== undefined
          ? { body: multipart ? body : JSON.stringify(body) }
          : {}),
      },
    );
    if (!response.ok) {
      const error = await createApiError(response, { context, fallback });
      return { ok: false, status: response.status, error: error.message };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (error) {
    return {
      ok: false,
      error: createRequestError(error, { context, fallback }).message,
    };
  }
}
const validId = (id: string) => /^[a-f\d]{24}$/.test(id);
export async function previewImport(
  form: FormData,
): Promise<ImportActionResult<ImportPreview>> {
  const file = form.get("file");
  if (!(file instanceof File) || !file.size || file.size > IMPORT_MAX_BYTES)
    return {
      ok: false,
      error: "Selecione um arquivo CSV ou OFX de até 2 MiB.",
    };
  let options;
  try {
    options = importOptionsSchema.parse(
      JSON.parse(String(form.get("options"))),
    );
  } catch {
    return {
      ok: false,
      error:
        "Confira a origem e o mapeamento das colunas. Cada campo deve usar uma coluna diferente.",
    };
  }
  const body = new FormData();
  body.set("file", file);
  body.set("options", JSON.stringify(options));
  return send<ImportPreview>("/preview", "POST", body);
}
export async function getImport(
  id: string,
): Promise<ImportActionResult<ImportPreview>> {
  if (!validId(id)) return { ok: false, error: "Lote inválido." };
  return send<ImportPreview>(`/${id}`, "GET");
}
export async function discardImport(
  id: string,
): Promise<ImportActionResult<{ message: string }>> {
  if (!validId(id)) return { ok: false, error: "Lote inválido." };
  return send(`/${id}`, "DELETE");
}
export async function confirmImport(
  id: string,
  rows: ImportChoice[],
): Promise<ImportActionResult<ImportResult>> {
  const parsed = confirmImportSchema.safeParse({ rows });
  if (!validId(id) || !parsed.success)
    return {
      ok: false,
      error: "Confira as linhas selecionadas e suas categorias.",
    };
  const result = await send<ImportResult>(
    `/${id}/confirm`,
    "POST",
    parsed.data,
  );
  // A lost response may still have committed some lines. Invalidate on every attempt.
  for (const tag of [
    "calendar",
    "transactions",
    "transaction",
    "dashboard",
    "budgets",
    "monthlyComparison",
    "sixMonthComparison",
    "wishlist",
  ])
    revalidateTag(tag);
  for (const path of [
    "/calendar",
    "/transactions",
    "/dashboard",
    "/comparative",
    "/wishlist",
  ])
    revalidatePath(path);
  return result;
}
