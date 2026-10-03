"use server";
import {
  revalidatePath,
  revalidateTag,
  unstable_noStore as noStore,
} from "next/cache";
import { createApiError, createRequestError } from "@/lib/api-error";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import type {
  CardInput,
  CardPurchaseInput,
  CreditCard,
  CardInvoice,
} from "@/models/card.model";

async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  noStore();
  const token = await getServerToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
  const context = `${method} /cards${path}`;
  const fallback = "Não foi possível atualizar o cartão. Tente novamente.";
  try {
    const response = await fetch(`${getServerBackendUrl()}/cards${path}`, {
      method,
      headers: createJsonHeaders(token),
      cache: "no-store",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok)
      throw await createApiError(response, { context, fallback });
    return (await response.json()) as T;
  } catch (error) {
    throw createRequestError(error, { context, fallback });
  }
}
function refresh() {
  for (const tag of [
    "cards",
    "transactions",
    "dashboard",
    "calendar",
    "budgets",
    "monthlyComparison",
    "sixMonthComparison",
  ])
    revalidateTag(tag);
  for (const path of [
    "/cards",
    "/transactions",
    "/dashboard",
    "/calendar",
    "/comparative",
  ])
    revalidatePath(path);
}
export async function getCards() {
  return request<CreditCard[]>("");
}
export async function getCard(id: string) {
  return request<CreditCard>(`/${encodeURIComponent(id)}`);
}
export async function createCard(input: CardInput) {
  const result = await request<CreditCard>("", "POST", input);
  refresh();
  return result;
}
export async function removeCard(id: string) {
  const result = await request<{ message: string }>(
    `/${encodeURIComponent(id)}`,
    "DELETE",
  );
  refresh();
  return result;
}
export async function createCardPurchase(id: string, input: CardPurchaseInput) {
  const result = await request<{ id: string }>(
    `/${encodeURIComponent(id)}/purchases`,
    "POST",
    input,
  );
  refresh();
  return result;
}
export async function payCardInvoice(id: string, cycle: string, date: string) {
  const result = await request<CardInvoice>(
    `/${encodeURIComponent(id)}/invoices/${encodeURIComponent(cycle)}/pay`,
    "POST",
    { date },
  );
  refresh();
  return result;
}
