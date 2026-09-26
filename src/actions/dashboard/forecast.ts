"use server";

import { unstable_noStore as noStore } from "next/cache";

import { createApiError, createRequestError } from "@/lib/api-error";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import type { DashboardForecast } from "@/models/dashboard.model";

export async function getDashboardForecast(): Promise<DashboardForecast | null> {
  noStore();
  const token = await getServerToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const response = await fetch(`${getServerBackendUrl()}/dashboard/forecast`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["dashboard", "forecast"] },
    });

    if (response.status === 404) return null;
    if (!response.ok) {
      throw await createApiError(response, {
        context: "GET /dashboard/forecast",
        fallback: "Não foi possível carregar a projeção do mês.",
      });
    }

    return (await response.json()) as DashboardForecast;
  } catch (error) {
    throw createRequestError(error, {
      context: "GET /dashboard/forecast",
      fallback: "Não foi possível carregar a projeção do mês.",
    });
  }
}
