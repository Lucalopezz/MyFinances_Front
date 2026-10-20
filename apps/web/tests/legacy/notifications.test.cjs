const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadTypescript } = require("../support/load-typescript.cjs");
const { notificationQueryOptions, NOTIFICATION_REFRESH_INTERVAL_MS } =
  loadTypescript("src/lib/notification-query.ts");
const model = loadTypescript("src/models/notification.model.ts");
const errors = loadTypescript("src/lib/api-error.ts", { "server-only": {} });

// Ativa o modo browser do Query Core para exercitar seus timers reais com um
// relógio controlado. Os listeners de DOM são substituídos explicitamente.
const previousWindow = globalThis.window;
globalThis.window = {};
const {
  QueryClient,
  QueryObserver,
  focusManager,
  onlineManager,
} = require("@tanstack/query-core");
if (previousWindow === undefined) delete globalThis.window;
else globalThis.window = previousWindow;
focusManager.setEventListener(() => () => {});
onlineManager.setEventListener(() => () => {});
const flush = async () => {
  for (let i = 0; i < 30; i++) await Promise.resolve();
};

function setup(t, enabled = true) {
  t.mock.timers.enable({
    apis: ["setTimeout", "setInterval", "Date"],
    now: 1_000_000,
  });
  focusManager.setFocused(true);
  onlineManager.setOnline(true);
  const calls = [];
  const client = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity } },
  });
  const options = {
    ...notificationQueryOptions(
      async () => {
        calls.push("sync");
      },
      async () => {
        calls.push("list");
        return [{ id: "notice", read: false }];
      },
    ),
    enabled,
  };
  client.mount();
  const observer = new QueryObserver(client, options);
  const unsubscribe = observer.subscribe(() => {});
  t.after(() => {
    unsubscribe();
    observer.destroy();
    client.unmount();
    client.clear();
  });
  return { client, observer, options, calls };
}

test("sincroniza antes de listar na entrada e a cada cinco minutos com a aba visível", async (t) => {
  const s = setup(t);
  await flush();
  assert.deepEqual(s.calls, ["sync", "list"]);
  t.mock.timers.tick(NOTIFICATION_REFRESH_INTERVAL_MS);
  await flush();
  assert.deepEqual(s.calls, ["sync", "list", "sync", "list"]);
});

test("não consulta com a aba oculta; retornar ao foco sincroniza novamente", async (t) => {
  const s = setup(t);
  await flush();
  focusManager.setFocused(false);
  t.mock.timers.tick(3 * NOTIFICATION_REFRESH_INTERVAL_MS);
  await flush();
  assert.equal(s.calls.length, 2);
  focusManager.setFocused(true);
  await flush();
  assert.equal(s.calls.length, 4);
});

test("recuperar a rede atualiza o feed e abrir o sininho permite refetch", async (t) => {
  const s = setup(t);
  await flush();
  onlineManager.setOnline(false);
  onlineManager.setOnline(true);
  await flush();
  assert.equal(s.calls.length, 4);
  await s.observer.refetch();
  assert.equal(s.calls.length, 6);
});

test("autenticação/disponibilidade desabilitada impede polling; recuperação atualiza", async (t) => {
  const s = setup(t, false);
  t.mock.timers.tick(NOTIFICATION_REFRESH_INTERVAL_MS);
  await flush();
  assert.equal(s.calls.length, 0);
  s.observer.setOptions({ ...s.options, enabled: true });
  await flush();
  assert.deepEqual(s.calls, ["sync", "list"]);
  s.observer.setOptions({ ...s.options, enabled: false });
  t.mock.timers.tick(NOTIFICATION_REFRESH_INTERVAL_MS);
  await flush();
  assert.equal(s.calls.length, 2);
});

test("cabeçalho/configurações compartilham cache; invalidar após mutação atualiza ambos", async (t) => {
  const s = setup(t);
  // As duas montagens ocorrem com a consulta em voo: existe um único POST/GET.
  const second = new QueryObserver(s.client, s.options);
  const unsubscribe = second.subscribe(() => {});
  t.after(() => {
    unsubscribe();
    second.destroy();
  });
  await flush();
  assert.equal(s.calls.length, 2);
  await s.client.invalidateQueries({ queryKey: ["notifications"] });
  assert.equal(s.calls.length, 4);
  assert.deepEqual(
    second.getCurrentResult().data,
    s.observer.getCurrentResult().data,
  );
});

test("resolução exclui avisos da contagem e explica seu estado no histórico", () => {
  assert.equal(model.isUnreadNotification({ read: false }), true);
  assert.equal(
    model.isUnreadNotification({
      read: false,
      resolvedAt: "2026-10-13T12:00:00Z",
    }),
    false,
  );
  assert.equal(
    model.notificationResolutionLabel({
      resolvedAt: "now",
      resolution: "PAID",
    }),
    "Resolvida: despesa paga",
  );
  assert.equal(model.notificationResolutionLabel({ read: true }), null);
});

function actions(fetch, token = "test-token") {
  return loadTypescript("src/actions/notification/notifications.ts", {
    "@/lib/backend-fetch": { backendFetch: fetch },
    "next/cache": { revalidateTag: () => {} },
    "@/lib/backend": {
      getServerBackendUrl: () => "http://backend",
      createJsonHeaders: (value) => ({ Authorization: `Bearer ${value}` }),
    },
    "@/lib/serverAuth": { getServerToken: async () => token },
    "@/lib/api-error": errors,
  });
}

test("action envia POST autenticado com prazo e consulta posterior sem cache compartilhado", async () => {
  const calls = [];
  const api = actions(async (url, init) => {
    calls.push({ url, init });
    return Response.json(
      url.endsWith("/sync")
        ? { processed: true, created: 1, resolved: 0, checkedAt: "now" }
        : [],
    );
  });
  await api.syncNotifications();
  await api.getNotifications();
  assert.equal(calls[0].url, "http://backend/notifications/sync");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers.Authorization, "Bearer test-token");
  assert.ok(calls[0].init.signal instanceof AbortSignal);
  assert.equal(calls[0].init.cache, "no-store");
  assert.equal(calls[1].url, "http://backend/notifications");
  assert.equal(calls[1].init.cache, "no-store");
});

test("action não chama API sem sessão e falhas 5xx preservam uma mensagem pública", async () => {
  let calls = 0;
  await assert.rejects(
    actions(async () => {
      calls++;
    }, null).syncNotifications(),
    /sessão expirou/,
  );
  assert.equal(calls, 0);
  await assert.rejects(
    actions(async () =>
      Response.json({ message: "detalhe interno" }, { status: 503 }),
    ).syncNotifications(),
    /Não foi possível atualizar as notificações/,
  );
});
