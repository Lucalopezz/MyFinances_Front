"use server";

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

  const response = await fetch(`${backendUrl}/notifications`, {
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

  const response = await fetch(`${backendUrl}/notifications/${id}/mark-as-read`, {
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
