import { describe, expect, it, vi } from "vitest";
import { notificationQueryOptions } from "@/lib/notification-query";

describe("Consulta de notificações sob demanda", () => {
  it("carrega o feed em uma única chamada, cuja API já gera os avisos", async () => {
    const notifications = [{ id: "aviso", read: false }];
    const list = vi.fn().mockResolvedValue(notifications);
    // A API garante geração e deduplicação. O navegador não precisa orquestrar POST + GET.
    const options = notificationQueryOptions(list);
    await expect(options.queryFn()).resolves.toEqual(notifications);
    expect(list).toHaveBeenCalledTimes(1);
  });

  it("propaga falhas para o cache manter os dados anteriores e permitir nova tentativa", async () => {
    const list = vi.fn().mockRejectedValue(new Error("API indisponível"));
    const options = notificationQueryOptions(list);
    await expect(options.queryFn()).rejects.toThrow("API indisponível");
  });
});
