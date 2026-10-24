import { NotificationInterface } from "@/models/notification.model";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/actions/notification/notifications";
import { queryKeys } from "@/hooks/queries/query-keys";
import { notificationQueryOptions } from "@/lib/notification-query";
import { useAuthContext } from "@/providers/auth-provider";
import { useBackendConnection } from "@/providers/backend-connection-provider";

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
    },
  });

  return {
    markAllAsRead: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useGetNotifications() {
  const { status } = useAuthContext();
  const connection = useBackendConnection();
  // O cabeçalho monta em qualquer página privada. Após recuperar a API,
  // habilitar novamente a query stale solicita uma nova sincronização.
  return useQuery<NotificationInterface[], Error>({
    ...notificationQueryOptions(getNotifications),
    enabled: status === "authenticated" && connection.status === "ready",
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: NotificationInterface["id"]) => {
      try {
        return await markNotificationAsRead(id);
      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Não foi possível atualizar a notificação.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
    },
  });
  return {
    markAsRead: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
