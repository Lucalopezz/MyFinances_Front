import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/exports/transactions/direct/route";
import { getServerToken } from "@/lib/serverAuth";

vi.mock("@/lib/serverAuth", () => ({ getServerToken: vi.fn() }));
vi.mock("@/lib/backend", () => ({
  getServerBackendUrl: () => "http://internal-api",
  createJsonHeaders: (token: string) => ({ Authorization: `Bearer ${token}` }),
}));

beforeEach(() => {
  vi.mocked(getServerToken).mockResolvedValue("private-token");
});
afterEach(() => vi.unstubAllGlobals());

describe("download direto pelo front", () => {
  it("entrega o arquivo em stream com token apenas na chamada interna", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response("arquivo financeiro", {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="transacoes.csv"',
          },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request(
        "http://localhost/api/exports/transactions/direct?format=CSV",
      ),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://internal-api/exports/transactions/direct",
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer private-token" },
        body: JSON.stringify({ format: "CSV" }),
      }),
    );
    expect(response.headers.get("content-disposition")).toContain(
      "transacoes.csv",
    );
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.text()).toBe("arquivo financeiro");
    expect(Array.from(response.headers.values()).join(" ")).not.toContain(
      "private-token",
    );
  });

  it("recusa download sem sessão antes de chamar a API", async () => {
    vi.mocked(getServerToken).mockResolvedValue(null);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await GET(
      new Request("http://localhost/api/exports/transactions/direct"),
    );
    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
