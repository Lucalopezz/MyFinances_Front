const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadTypescript } = require("./load-typescript.cjs");

const formats = loadTypescript("src/models/transaction-export.ts");
const errors = loadTypescript("src/lib/api-error.ts", { "server-only": {} });
const dependencies = {
  "@/models/transaction-export": formats,
  "@/lib/api-error": errors,
  "@/lib/backend": {
    getServerBackendUrl: () => "http://backend",
    createJsonHeaders: (token) => ({ Authorization: `Bearer ${token}` }),
  },
  "@/lib/serverAuth": { getServerToken: async () => "test-token" },
  "next/cache": { unstable_noStore: () => {} },
};

test("offers PDF, CSV and XLSX while keeping PDF for legacy responses", () => {
  assert.deepEqual(Object.keys(formats.TRANSACTION_EXPORT_FORMATS), [
    "PDF",
    "CSV",
    "XLSX",
  ]);
  assert.equal(formats.normalizeTransactionExportFormat(undefined), "PDF");
  assert.equal(formats.normalizeTransactionExportFormat("XLSX"), "XLSX");
  assert.equal(
    formats.TRANSACTION_EXPORT_FORMATS.CSV.option,
    "Abrir no Excel (.csv)",
  );
});

// A solicitação e a consulta seguinte devem manter XLSX. Uma normalização
// legada que reconheça apenas CSV faria a tela baixar o arquivo como PDF.
test("creates an XLSX export and preserves its format when polling", async () => {
  const requests = [];
  const actions = loadTypescript("src/actions/export/transactions.ts", {
    ...dependencies,
    "@/lib/backend-fetch": {
      backendFetch: async (url, init) => {
        requests.push({ url, init });
        return Response.json({
          id: "export-test",
          status: "COMPLETED",
          format: "XLSX",
          progress: 100,
        });
      },
    },
  });
  assert.equal((await actions.createTransactionExport("XLSX")).format, "XLSX");
  assert.deepEqual(JSON.parse(requests[0].init.body), { format: "XLSX" });
  assert.equal(requests[0].init.headers.Authorization, "Bearer test-token");
  assert.equal((await actions.getTransactionExportStatus()).format, "XLSX");
  assert.equal(requests[1].init.cache, "no-store");
});

for (const format of ["PDF", "CSV", "XLSX"]) {
  // O proxy encaminha os bytes sem reconstruir o arquivo. Se a API não enviar
  // cabeçalhos, o fallback precisa corresponder ao formato do link de download.
  test(`downloads ${format} with the proper fallback headers and unchanged bytes`, async (t) => {
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    const fetch = t.mock.method(
      globalThis,
      "fetch",
      async () => new Response(bytes),
    );
    const { GET } = loadTypescript(
      "src/app/api/exports/transactions/[id]/download/route.ts",
      dependencies,
    );
    const response = await GET(
      new Request(`http://frontend/download?format=${format}`),
      {
        params: Promise.resolve({ id: "export-test" }),
      },
    );
    assert.equal(
      response.headers.get("content-type"),
      formats.TRANSACTION_EXPORT_FORMATS[format].contentType,
    );
    assert.equal(
      response.headers.get("content-disposition"),
      `attachment; filename="transacoes.${format.toLowerCase()}"`,
    );
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
    assert.equal(
      fetch.mock.calls[0].arguments[1].headers.Authorization,
      "Bearer test-token",
    );
  });
}

test("keeps authoritative backend headers even when the URL suggests another format", async (t) => {
  const contentType = formats.TRANSACTION_EXPORT_FORMATS.XLSX.contentType;
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response("file", {
        headers: {
          "content-type": contentType,
          "content-disposition": 'attachment; filename="export-test.xlsx"',
        },
      }),
  );
  const { GET } = loadTypescript(
    "src/app/api/exports/transactions/[id]/download/route.ts",
    dependencies,
  );
  const response = await GET(
    new Request("http://frontend/download?format=CSV"),
    {
      params: Promise.resolve({ id: "export-test" }),
    },
  );
  assert.equal(response.headers.get("content-type"), contentType);
  assert.equal(
    response.headers.get("content-disposition"),
    'attachment; filename="export-test.xlsx"',
  );
});

test("does not request an export download without an authenticated session", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () =>
    assert.fail("Requisição sem sessão"),
  );
  const { GET } = loadTypescript(
    "src/app/api/exports/transactions/[id]/download/route.ts",
    {
      ...dependencies,
      "@/lib/serverAuth": { getServerToken: async () => null },
    },
  );
  const response = await GET(
    new Request("http://frontend/download?format=XLSX"),
    {
      params: Promise.resolve({ id: "export-test" }),
    },
  );
  assert.equal(response.status, 401);
  assert.equal(fetch.mock.callCount(), 0);
});
