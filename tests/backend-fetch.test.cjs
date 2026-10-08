const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadTypescript } = require("./load-typescript.cjs");
// Os módulos são reais; server-only e os limites externos do Next são simulados.
// Não precisamos de API, cookie real, credenciais ou banco para verificar a política.
const { backendFetch } = loadTypescript("src/lib/backend-fetch.ts", { "server-only": {} });
const errors = loadTypescript("src/lib/api-error.ts", { "server-only": {} });

// Uma repetição deve manter a intenção da action (headers/cache) e liberar
// a resposta descartada. Só modificamos signal/política de transporte do GET.
test("GET retries a temporary gateway failure, preserving cache policy and headers", async (t) => {
  const requests = [];
  const transient = new Response("warming", { status: 503 });
  t.mock.method(globalThis, "fetch", async (url, init) => {
    requests.push({ url, init });
    return requests.length === 1 ? transient : Response.json({ status: "ok" });
  });
  const response = await backendFetch("http://backend/health", {
    headers: { Authorization: "Bearer test" }, cache: "no-store",
  });
  assert.equal(response.status, 200);
  assert.equal(requests.length, 2);
  assert.equal(transient.bodyUsed, true);
  assert.equal(requests[1].init.cache, "no-store");
  assert.equal(requests[1].init.headers.Authorization, "Bearer test");
  assert.ok(requests[1].init.signal instanceof AbortSignal);
});

// Erro de rede admite uma repetição. Os status fora da lista transitória seguem
// para a action, que decide autenticação, ausência de registro e outras regras.
test("GET retries a network error only once; permanent HTTP errors are returned without retry", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => { throw new TypeError("offline"); });
  await assert.rejects(backendFetch("http://backend/user"), /offline/);
  assert.equal(fetch.mock.callCount(), 2);
  for (const status of [400, 401, 403, 404, 429, 500]) {
    fetch.mock.resetCalls();
    fetch.mock.mockImplementation(async () => new Response(null, { status }));
    assert.equal((await backendFetch("http://backend/user")).status, status);
    assert.equal(fetch.mock.callCount(), 1);
  }
});

// Cancelar é intenção do chamador; não deve virar uma nova tentativa automática.
test("caller cancellation is preserved and never retried", async (t) => {
  const controller = new AbortController();
  controller.abort();
  const fetch = t.mock.method(globalThis, "fetch", async (_url, init) => {
    assert.equal(init.signal.aborted, true);
    throw new DOMException("cancelled", "AbortError");
  });
  await assert.rejects(backendFetch("http://backend/user", { signal: controller.signal }), /cancelled/);
  assert.equal(fetch.mock.callCount(), 1);
});

// Simulamos os sinais de prazo para verificar as duas janelas de 15s sem
// esperar 30s reais. Cada tentativa precisa receber um signal próprio.
test("each read attempt has a fresh 15s deadline", async (t) => {
  const deadlines = [];
  t.mock.method(AbortSignal, "timeout", (milliseconds) => {
    deadlines.push(milliseconds);
    const controller = new AbortController();
    controller.abort(new DOMException("timeout", "TimeoutError"));
    return controller.signal;
  });
  const fetch = t.mock.method(globalThis, "fetch", async (_url, { signal }) => { throw signal.reason; });
  await assert.rejects(backendFetch("http://backend/user"), /timeout/);
  assert.deepEqual(deadlines, [15_000, 15_000]);
  assert.equal(fetch.mock.callCount(), 2);
});

// Perder a resposta de uma gravação não prova que o servidor não gravou. Estes
// casos protegem contra duplicação financeira, inclusive diante de HTTP 503.
test("POST, PATCH and DELETE are sent once even if the result is lost or returns 503", async (t) => {
  for (const method of ["POST", "PATCH", "DELETE"]) {
    const fetch = t.mock.method(globalThis, "fetch", async () => { throw new TypeError("lost response"); });
    await assert.rejects(backendFetch("http://backend/transactions", { method }), /lost response/);
    assert.equal(fetch.mock.callCount(), 1);
    fetch.mock.restore();
    const unavailable = t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 503 }));
    assert.equal((await backendFetch("http://backend/transactions", { method })).status, 503);
    assert.equal(unavailable.mock.callCount(), 1);
    unavailable.mock.restore();
  }
});

function userModule(request, token = "test-token") {
  // O valor de token é apenas fixture. O teste injeta a leitura server-side e
  // controla a resposta de GET /user/get-one sem expor uma sessão real.
  return loadTypescript("src/actions/user/user.ts", {
    "@/lib/backend-fetch": { backendFetch: request },
    "@/lib/backend": { getServerBackendUrl: () => "http://backend", createJsonHeaders: () => ({}) },
    "@/lib/serverAuth": { getServerToken: async () => token },
    "next/cache": { unstable_noStore: () => {} },
    "@/lib/api-error": errors,
  });
}

// A principal proteção contra logout por cold start: null tem significado de
// sessão ausente/inválida, enquanto timeout e 503 precisam continuar como erros.
test("profile is absent only without a token or with 401; timeout and 503 remain recoverable errors", async (t) => {
  t.mock.method(console, "error", () => {});
  let called = false;
  assert.equal(await userModule(async () => { called = true; }, null).getUser(), null);
  assert.equal(called, false);
  assert.equal(await userModule(async () => new Response(null, { status: 401 })).getUser(), null);
  await assert.rejects(userModule(async () => new Response(null, { status: 503 })).getUser(), /perfil/);
  await assert.rejects(userModule(async () => { throw new DOMException("timeout", "TimeoutError"); }).getUser(), /perfil/);
  const profile = { id: "user-test", name: "Test" };
  assert.deepEqual(await userModule(async () => Response.json(profile)).getUser(), profile);
});

// O JWT de teste só precisa de exp porque requireAuth faz a checagem local.
// Isso não é validação de assinatura: a autorização real continua com a API.
test("only actual missing or expired tokens cause requireAuth to redirect", async () => {
  const { isJwtExpired } = loadTypescript("src/lib/jwt.ts");
  const jwt = (exp) => `header.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.signature`;
  let cookie;
  const { requireAuth } = loadTypescript("src/lib/serverAuth.ts", {
    "next/headers": { cookies: async () => ({ get: () => cookie ? { value: cookie } : undefined }) },
    "next/cache": { unstable_noStore: () => {} },
    "next/navigation": { redirect: (path) => { throw new Error(`redirect:${path}`); } },
    "@/lib/backend": { AUTH_COOKIE_NAME: "mf_token" },
    "@/lib/jwt": { isJwtExpired },
  });
  cookie = jwt(Math.floor(Date.now() / 1_000) + 3_600);
  assert.equal(await requireAuth(), cookie);
  cookie = jwt(Math.floor(Date.now() / 1_000) - 1);
  await assert.rejects(requireAuth(), /redirect:\/login/);
  cookie = null;
  await assert.rejects(requireAuth(), /redirect:\/login/);
});

// Verifica os contratos entre browser/proxy/API: prazos, ausência de headers
// autenticados, resposta vazia e no-store. Saúde não deve depender de sessão.
test("health proxy returns an uncached 204/503 and never forwards authentication", async (t) => {
  const { GET, maxDuration } = loadTypescript("src/app/api/health/route.ts", {
    "@/lib/backend": { getServerBackendUrl: () => "http://backend" },
  });
  const deadlines = [];
  t.mock.method(AbortSignal, "timeout", (milliseconds) => {
    deadlines.push(milliseconds);
    return new AbortController().signal;
  });
  const fetch = t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(url, "http://backend/health");
    assert.equal(init.cache, "no-store");
    assert.equal(init.headers, undefined);
    return new Response("ok");
  });
  const healthy = await GET();
  assert.equal(healthy.status, 204);
  assert.equal(healthy.headers.get("Cache-Control"), "no-store");
  assert.equal(await healthy.text(), "");
  fetch.mock.mockImplementation(async () => new Response(null, { status: 503 }));
  assert.equal((await GET()).status, 503);
  fetch.mock.mockImplementation(async () => { throw new TypeError("offline"); });
  assert.equal((await GET()).status, 503);
  assert.deepEqual(deadlines, [20_000, 20_000, 20_000]);
  assert.equal(maxDuration, 30);
});

// Detalhes técnicos são deliberadamente colocados no body para garantir que
// não atravessem o filtro de 5xx e apareçam em toast/formulário.
test("internal failures show the operation fallback instead of technical response details", async (t) => {
  t.mock.method(console, "error", () => {});
  for (const status of [500, 502, 503, 504]) {
    const response = Response.json({ message: "Backend API Prisma timeout in POST /transactions" }, { status });
    const error = await errors.createApiError(response, {
      context: "POST /transactions", fallback: "Não foi possível criar a transação.",
    });
    assert.equal(error.message, "Não foi possível criar a transação.");
  }
});

// Ocultar infraestrutura não deve apagar a orientação de uma validação de negócio.
test("business validation messages remain available to explain a rejected operation", async (t) => {
  t.mock.method(console, "error", () => {});
  const response = Response.json({ message: "O valor deve ser maior que zero." }, { status: 400 });
  const error = await errors.createApiError(response, {
    context: "POST /transactions", fallback: "Não foi possível criar a transação.",
  });
  assert.equal(error.message, "O valor deve ser maior que zero.");
});

// Um worker pode falhar dentro de uma consulta HTTP bem-sucedida. Conferimos
// que a normalização protege esse caminho e mantém status/id para o fluxo da UI.
test("export processing failures show a simple message while preserving their status", async () => {
  for (const error of ["Backend worker timeout", { message: "Prisma API error" }, { error: "Redis connection refused" }]) {
    const { getTransactionExportStatus } = loadTypescript("src/actions/export/transactions.ts", {
      "@/lib/backend-fetch": { backendFetch: async () => Response.json({ id: "export-test", status: "FAILED", error }) },
      "@/lib/backend": { getServerBackendUrl: () => "http://backend", createJsonHeaders: () => ({}) },
      "@/lib/serverAuth": { getServerToken: async () => "test-token" },
      "next/cache": { unstable_noStore: () => {} },
      "@/lib/api-error": errors,
    });
    const result = await getTransactionExportStatus();
    assert.equal(result.status, "FAILED");
    assert.equal(result.id, "export-test");
    assert.equal(result.error, "Não foi possível gerar o arquivo. Tente novamente.");
  }
});
