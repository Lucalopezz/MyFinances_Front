"use server";

import { revalidateTag } from "next/cache";

import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import type { NotificationInterface } from "@/models/notification.model";

export async function getNotifications(): Promise<NotificationInterface[]> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    throw new Error("Sessão não encontrada");
  }

  const response = await fetch(`${backendUrl}/notifications`, {
    headers: createJsonHeaders(token),
    cache: "no-store",
    next: { tags: ["notifications"] },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar notificações");
  }

  return response.json();
}

export async function markNotificationAsRead(
  id: NotificationInterface["id"],
) {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    throw new Error("Sessão não encontrada");
  }

  const response = await fetch(`${backendUrl}/notifications/${id}/mark-as-read`, {
    method: "PATCH",
    headers: createJsonHeaders(token),
    body: JSON.stringify({ read: true }),
  });

  if (!response.ok) {
    throw new Error("Erro ao marcar notificação como lida");
  }

  revalidateTag("notifications");

  return response.json();
}
