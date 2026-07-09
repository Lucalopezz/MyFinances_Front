import { NotificationInterface } from "@/models/notification.model";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../useQueryClient";
import {
  getNotifications,
  markNotificationAsRead,
} from "@/actions/notification/notifications";

async function fetchNotification(): Promise<NotificationInterface[]> {
  try {
    return await getNotifications();
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Erro ao buscar dados do dashboard");
  }
}

export function useGetNotifications() {
  return useQuery<NotificationInterface[], Error>({
    queryKey: ["notifications"],
    queryFn: () => fetchNotification(),
  });
}

export function useMarkAsRead() {
  const mutation = useMutation({
    mutationFn: async (id: NotificationInterface["id"]) => {
      try {
        return await markNotificationAsRead(id);
      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Erro ao editar");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
  return {
    markAsRead: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
