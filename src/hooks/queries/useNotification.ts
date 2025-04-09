import { NotificationInterface } from "@/interfaces/notification.interface";
import api from "@/utils/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { queryClient } from "../useQueryClient";

async function fetchNotification(): Promise<NotificationInterface[]> {
  try {
    const response = await api.get<NotificationInterface[]>("/notifications");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message);
    }
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
      const read = {
        read: true,
      };
      try {
        const response = await api.patch(
          `/notifications/${id}/mark-as-read`,
          read
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || "Erro ao editar");
        }
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
