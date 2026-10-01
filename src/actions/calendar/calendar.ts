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
  FinancialCalendar,
  RecurringIncome,
  CalendarEvent,
} from "@/models/calendar.model";
import {
  recurringIncomeSchema,
  receiptSchema,
  type RecurringIncomeInput,
  type ReceiptInput,
} from "@/schemas/recurring-income.schema";
async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  noStore();
  const token = await getServerToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
  const context = `${method} ${path}`;
  const fallback = "Não foi possível atualizar o calendário. Tente novamente.";
  try {
    const response = await fetch(`${getServerBackendUrl()}/calendar${path}`, {
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
function revalidate() {
  for (const tag of [
    "calendar",
    "recurring-incomes",
    "transactions",
    "transaction",
    "dashboard",
    "forecast",
    "budgets",
    "monthlyComparison",
    "sixMonthComparison",
    "wishlist",
  ])
    revalidateTag(tag);
  for (const path of [
    "/calendar",
    "/dashboard",
    "/transactions",
    "/comparative",
    "/wishlist",
  ])
    revalidatePath(path);
}
export async function getFinancialCalendar(month: string) {
  return request<FinancialCalendar>(`?month=${encodeURIComponent(month)}`);
}
export async function getRecurringIncomes() {
  return request<RecurringIncome[]>("/incomes");
}
export async function saveRecurringIncome(
  input: RecurringIncomeInput,
  id?: string,
  revision?: number,
) {
  const data = recurringIncomeSchema.parse(input);
  const result = await request<RecurringIncome>(
    id ? `/incomes/${encodeURIComponent(id)}` : "/incomes",
    id ? "PATCH" : "POST",
    id ? { ...data, revision } : data,
  );
  revalidate();
  return result;
}
export async function pauseRecurringIncome(
  id: string,
  paused: boolean,
  revision: number,
) {
  const result = await request<RecurringIncome>(
    `/incomes/${encodeURIComponent(id)}`,
    "PATCH",
    { paused, revision },
  );
  revalidate();
  return result;
}
export async function confirmIncome(
  event: Pick<CalendarEvent, "sourceId" | "dueDate">,
  input: ReceiptInput,
) {
  const result = await request<CalendarEvent>(
    `/incomes/${encodeURIComponent(event.sourceId)}/occurrences/${encodeURIComponent(event.dueDate)}/confirm`,
    "POST",
    receiptSchema.parse(input),
  );
  revalidate();
  return result;
}
