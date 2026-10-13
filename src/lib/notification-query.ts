import type { NotificationInterface } from "@/models/notification.model";

export const NOTIFICATION_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Sincroniza antes de listar para que o primeiro acesso já inclua vencidos.
 * O cache é compartilhado por cabeçalho/configurações e as consultas em voo
 * são deduplicadas pelo React Query. O backend controla a frequência real.
 */
export function notificationQueryOptions(
  synchronize: () => Promise<unknown>,
  list: () => Promise<NotificationInterface[]>,
) {
  return {
    queryKey: ["notifications"] as const,
    queryFn: async () => {
      await synchronize();
      return list();
    },
    staleTime: 0,
    refetchInterval: NOTIFICATION_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Repetir esta consulta é seguro: o POST possui recibos únicos no banco.
    retry: 1,
  };
}
