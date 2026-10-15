import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BACKEND_PING_INTERVAL_MS,
  createBackendConnection,
} from "@/lib/backend-connection";
const stores: ReturnType<typeof createBackendConnection>[] = [];
afterEach(() => {
  for (const store of stores.splice(0)) store.stop();
});
function setup(
  probe = vi
    .fn<(signal: AbortSignal) => Promise<boolean>>()
    .mockResolvedValue(true),
) {
  vi.useFakeTimers();
  vi.setSystemTime(1_000_000);
  let visible = true,
    online = true;
  const onRecovery = vi.fn();
  const connection = createBackendConnection({
    probe,
    isVisible: () => visible,
    isOnline: () => online,
    onRecovery,
  });
  stores.push(connection);
  return {
    connection,
    probe,
    onRecovery,
    visibility: (value: boolean) => {
      visible = value;
    },
    network: (value: boolean) => {
      online = value;
    },
  };
}
const flush = async () => {
  for (let index = 0; index < 10; index++) await Promise.resolve();
};

describe("Disponibilidade sem efeitos sobre a sessão", () => {
  it("deduplica verificações simultâneas e publica um único resultado", async () => {
    let finish!: (ready: boolean) => void;
    const state = setup(
      vi.fn(
        () =>
          new Promise<boolean>((resolve) => {
            finish = resolve;
          }),
      ),
    );
    state.connection.start();
    const first = state.connection.reconnect();
    expect(state.connection.reconnect()).toBe(first);
    expect(state.probe).toHaveBeenCalledTimes(1);
    finish(true);
    expect(await first).toBe(true);
    expect(state.connection.getSnapshot().status).toBe("ready");
  });
  it("limita o aquecimento e notifica recuperação depois de duas falhas", async () => {
    const state = setup(
      vi
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValue(true),
    );
    state.connection.start();
    await flush();
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(5000);
    expect(state.probe).toHaveBeenCalledTimes(3);
    expect(state.connection.getSnapshot()).toMatchObject({
      status: "ready",
      recoveryCount: 1,
    });
    expect(state.onRecovery).toHaveBeenCalledTimes(1);
  });
  it("não mantém pings com a aba oculta e verifica novamente ao retomar", async () => {
    const state = setup();
    state.connection.start();
    await flush();
    state.visibility(false);
    state.connection.resume();
    await vi.advanceTimersByTimeAsync(BACKEND_PING_INTERVAL_MS * 2);
    expect(state.probe).toHaveBeenCalledTimes(1);
    state.visibility(true);
    state.connection.resume();
    await flush();
    expect(state.probe).toHaveBeenCalledTimes(2);
  });
  it("offline cancela a rodada e permite reconexão imediata", async () => {
    const state = setup();
    state.connection.start();
    await flush();
    state.network(false);
    state.connection.offline();
    expect(state.connection.getSnapshot().status).toBe("offline");
    state.network(true);
    state.connection.resume();
    await flush();
    expect(state.connection.getSnapshot().status).toBe("ready");
    expect(state.onRecovery).toHaveBeenCalledTimes(1);
  });
});
