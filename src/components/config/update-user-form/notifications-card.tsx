"use client";

import { type ReactNode, useMemo } from "react";
import {
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NotificationInterface,
  NotificationsType,
} from "@/models/notification.model";
import {
  useGetNotifications,
  useMarkAsRead,
} from "@/hooks/queries/useNotification";
import { formatTimeAgo } from "@/utils/formatters";

import { ConfigCard } from "./config-card";

const notificationTypeLabel: Record<NotificationsType, string> = {
  [NotificationsType.ALERT]: "Alerta",
  [NotificationsType.REMINDER]: "Lembrete",
  [NotificationsType.INFO]: "Informação",
};

const notificationTypeClassName: Record<NotificationsType, string> = {
  [NotificationsType.ALERT]:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-800/30 dark:text-red-300",
  [NotificationsType.REMINDER]:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-800/30 dark:text-amber-300",
  [NotificationsType.INFO]:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/60 dark:bg-blue-800/30 dark:text-blue-300",
};

interface NotificationsCardProps {
  compactMode: boolean;
  showReadNotifications: boolean;
}

export function NotificationsCard({
  compactMode,
  showReadNotifications,
}: NotificationsCardProps) {
  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useGetNotifications();
  const { markAsRead, isLoading: isMarkingAsRead } = useMarkAsRead();

  const openNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) => showReadNotifications || !notification.read,
      ),
    [notifications, showReadNotifications],
  );
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  async function handleMarkAsRead(id: NotificationInterface["id"]) {
    try {
      await markAsRead(id);
      toast.success("Notificação marcada como lida");
    } catch {
      toast.error("Erro ao atualizar notificação");
    }
  }

  return (
    <ConfigCard
      actions={<UnreadBadge unreadCount={unreadCount} />}
      className="h-fit"
      description="Acompanhe avisos pendentes sem abrir o menu do cabeçalho."
      icon={Bell}
      title="Notificações abertas"
    >
      {isLoading ? (
        <NotificationState
          icon={<Clock3 className="size-5" />}
          text="Carregando notificações..."
        />
      ) : isError ? (
        <NotificationState
          icon={<CircleAlert className="size-5" />}
          text="Erro ao carregar notificações."
        />
      ) : openNotifications.length === 0 ? (
        <NotificationState
          icon={<CheckCircle2 className="size-5" />}
          text="Não há notificações abertas."
        />
      ) : (
        <ul className="space-y-3">
          {openNotifications.map((notification) => (
            <NotificationItem
              compactMode={compactMode}
              disabled={isMarkingAsRead}
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </ul>
      )}
    </ConfigCard>
  );
}

function UnreadBadge({ unreadCount }: { unreadCount: number }) {
  return (
    <Badge
      variant="outline"
      className={
        unreadCount > 0
          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/60 dark:bg-blue-800/50 dark:text-blue-300"
          : "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300"
      }
    >
      {unreadCount} abertas
    </Badge>
  );
}

function NotificationItem({
  compactMode,
  disabled,
  notification,
  onMarkAsRead,
}: {
  compactMode: boolean;
  disabled: boolean;
  notification: NotificationInterface;
  onMarkAsRead: (id: NotificationInterface["id"]) => void;
}) {
  return (
    <li
      className={`rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50 ${
        compactMode ? "p-3" : "p-4"
      } ${notification.read ? "opacity-75" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={notificationTypeClassName[notification.type]}
            >
              {notificationTypeLabel[notification.type]}
            </Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {notification.title}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {notification.message}
          </p>
        </div>
        {!notification.read && (
          <Button
            aria-label="Marcar notificação como lida"
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-800/50 dark:hover:text-blue-200"
            disabled={disabled}
            onClick={() => onMarkAsRead(notification.id)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <CheckCircle2 className="size-4" />
          </Button>
        )}
      </div>
    </li>
  );
}

function NotificationState({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-gray-200 p-6 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
      {icon}
      <p className="text-sm">{text}</p>
    </div>
  );
}
