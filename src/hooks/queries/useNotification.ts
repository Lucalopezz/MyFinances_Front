import { NotificationInterface } from "@/models/notification.model";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markNotificationAsRead,
} from "@/actions/notification/notifications";
import { queryKeys } from "@/hooks/queries/query-keys";

async function fetchNotification(): Promise<NotificationInterface[]> {
  try {
    return await getNotifications();
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Não foi possível carregar as notificações.");
  }
}

export function useGetNotifications() {
  return useQuery<NotificationInterface[], Error>({
    queryKey: queryKeys.notifications.all(),
    queryFn: () => fetchNotification(),
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
