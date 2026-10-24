import type { NotificationInterface } from "@/models/notification.model";

export const NOTIFICATION_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * A leitura na API gera avisos antes de devolver o feed, inclusive vencidos.
 * O cache é compartilhado por cabeçalho/configurações e as consultas em voo
 * são deduplicadas pelo React Query. O backend controla a frequência real.
 */
export function notificationQueryOptions(
  list: () => Promise<NotificationInterface[]>,
) {
  return {
    queryKey: ["notifications"] as const,
    queryFn: list,
    staleTime: 0,
    refetchInterval: NOTIFICATION_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Repetir a leitura é seguro: a geração usa recibos únicos no banco.
    retry: 1,
  };
}
