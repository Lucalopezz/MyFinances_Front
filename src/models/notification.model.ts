export interface NotificationInterface {
  title: string;
  message: string;
  type: NotificationsType;
  userId: string;
  id: string;
  read: boolean;
  createdAt?: Date;
  sourceExpenseId?: string | null;
  dueDateKey?: string | null;
  event?: "UPCOMING" | "OVERDUE" | null;
  resolvedAt?: string | null;
  resolution?: string | null;
}

/** Leitura e resolução são estados distintos; avisos resolvidos não são pendências. */
export function isUnreadNotification(notification: NotificationInterface) {
  return !notification.read && !notification.resolvedAt;
}

/** Explica o encerramento no histórico sem substituir a mensagem original. */
export function notificationResolutionLabel(
  notification: NotificationInterface,
) {
  if (!notification.resolvedAt) return null;
  const labels: Record<string, string> = {
    PAID: "Resolvida: despesa paga",
    EXPENSE_DELETED: "Resolvida: despesa excluída",
    DUE_DATE_CHANGED: "Resolvida: vencimento alterado",
    SUPERSEDED: "Substituída pelo alerta de atraso",
  };
  return labels[notification.resolution ?? ""] ?? "Resolvida";
}

export enum NotificationsType {
  ALERT = "ALERT",
  REMINDER = "REMINDER",
  INFO = "INFO",
}
