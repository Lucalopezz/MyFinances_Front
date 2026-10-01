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
  Category,
  CategoryRule,
  CategoryResolution,
} from "@/models/category.model";
import {
  categorySchema,
  ruleSchema,
  type CategoryInput,
  type RuleInput,
} from "@/schemas/category.schema";
import type { TransactionType } from "@/constants/transaction-categories";

async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  noStore();
  const token = await getServerToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
  const context = `${method} ${path}`;
  const fallback =
    "Não foi possível acessar categorias e regras. Tente novamente.";
  try {
    const response = await fetch(`${getServerBackendUrl()}${path}`, {
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
    "categories",
    "category-rules",
    "transactions",
    "transaction",
    "dashboard",
    "budgets",
    "fixed-expenses",
    "fixed-expense",
    "monthlyComparison",
    "sixMonthComparison",
  ])
    revalidateTag(tag);
  for (const path of [
    "/calendar",
    "/config",
    "/dashboard",
    "/transactions",
    "/fixed-expenses",
    "/comparative",
  ])
    revalidatePath(path);
}
export async function getCategories() {
  return request<Category[]>("/categories");
}
export async function getCategoryRules() {
  return request<CategoryRule[]>("/category-rules");
}
export async function saveCategory(input: CategoryInput, id?: string) {
  const data = categorySchema.parse(input);
  const { type, ...editable } = data;
  const result = await request<Category>(
    id ? `/categories/${encodeURIComponent(id)}` : "/categories",
    id ? "PATCH" : "POST",
    id ? editable : { ...editable, type },
  );
  revalidate();
  return result;
}
export async function archiveCategory(id: string, archived: boolean) {
  const result = await request<Category>(
    `/categories/${encodeURIComponent(id)}`,
    "PATCH",
    { archived },
  );
  revalidate();
  return result;
}
export async function saveCategoryRule(input: RuleInput, id?: string) {
  const result = await request<CategoryRule>(
    id ? `/category-rules/${encodeURIComponent(id)}` : "/category-rules",
    id ? "PATCH" : "POST",
    ruleSchema.parse(input),
  );
  revalidate();
  return result;
}
export async function setCategoryRuleEnabled(id: string, enabled: boolean) {
  const result = await request<CategoryRule>(
    `/category-rules/${encodeURIComponent(id)}`,
    "PATCH",
    { enabled },
  );
  revalidate();
  return result;
}
export async function deleteCategoryRule(id: string) {
  await request(`/category-rules/${encodeURIComponent(id)}`, "DELETE");
  revalidate();
}
export async function testCategoryRule(input: RuleInput, description: string) {
  return request<{ matches: boolean; category: string | null }>(
    "/category-rules/test",
    "POST",
    { ...ruleSchema.parse(input), description },
  );
}
export async function suggestCategory(
  type: TransactionType,
  description: string,
) {
  return request<CategoryResolution>("/categories/resolve", "POST", {
    type,
    description,
  });
}
