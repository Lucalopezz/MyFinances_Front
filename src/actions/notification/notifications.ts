"use server";

// Transporte compartilhado de notificações: GET/HEAD têm prazo e repetição
// limitada em falhas transitórias; gravações continuam com envio único. URL,
// cookie e Authorization são tratados no servidor pelos consumidores abaixo.
// A política completa fica em backend-fetch.ts, sem duplicar timers neste domínio.
import { backendFetch } from "@/lib/backend-fetch";

import { revalidateTag } from "next/cache";

import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import type { NotificationInterface } from "@/models/notification.model";
import { createApiError } from "@/lib/api-error";

export async function getNotifications(): Promise<NotificationInterface[]> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  const response = await backendFetch(`${backendUrl}/notifications`, {
    headers: createJsonHeaders(token),
    cache: "no-store",
    next: { tags: ["notifications"] },
  });

  if (!response.ok) {
    throw await createApiError(response, {
      context: "GET /notifications",
      fallback: "Não foi possível carregar as notificações.",
    });
  }

  return response.json();
}

export async function markNotificationAsRead(
  id: NotificationInterface["id"],
) {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  const response = await backendFetch(`${backendUrl}/notifications/${id}/mark-as-read`, {
    method: "PATCH",
    headers: createJsonHeaders(token),
    body: JSON.stringify({ read: true }),
  });

  if (!response.ok) {
    throw await createApiError(response, {
      context: `PATCH /notifications/${id}/mark-as-read`,
      fallback: "Não foi possível atualizar a notificação.",
    });
  }

  revalidateTag("notifications");

  return response.json();
}

export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  const token = await getServerToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  const response = await backendFetch(
    `${getServerBackendUrl()}/notifications/mark-all-as-read`,
    {
      method: "PATCH",
      headers: createJsonHeaders(token),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw await createApiError(response, {
      context: "PATCH /notifications/mark-all-as-read",
      fallback: "Não foi possível marcar todas as notificações como lidas.",
    });
  }

  revalidateTag("notifications");
  return response.json();
}
