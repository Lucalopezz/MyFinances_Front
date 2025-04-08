import { NotificationInterface } from "@/interfaces/notification.interface";
import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchNotification(): Promise<NotificationInterface[]>{
    try {
        const response = await api.get<NotificationInterface[]>("/notifications");
        return response.data; 
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(
              error.response.data.message
            );
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
  