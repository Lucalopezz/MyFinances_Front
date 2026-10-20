import { beforeEach, describe, expect, it, vi } from "vitest";
import { backendFetch } from "@/lib/backend-fetch";
import {
  createApiError,
  createRequestError,
  PublicApiError,
} from "@/lib/api-error";
const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("Repetição segura do transporte", () => {
  it.each([502, 503, 504])(
    "repete GET HTTP %s uma vez preservando headers e cache",
    async (status) => {
      const transient = new Response("warming", { status });
      fetchMock
        .mockResolvedValueOnce(transient)
        .mockResolvedValueOnce(Response.json({ ok: true }));
      expect(
        (
          await backendFetch("http://backend.test", {
            headers: { Authorization: "Bearer fixture" },
            cache: "no-store",
          })
        ).ok,
      ).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(transient.bodyUsed).toBe(true);
      expect(fetchMock.mock.calls[1][1]).toMatchObject({
        headers: { Authorization: "Bearer fixture" },
        cache: "no-store",
        signal: expect.any(AbortSignal),
      });
    },
  );
  it.each([400, 401, 403, 404, 429, 500])(
    "não repete GET HTTP %s",
    async (status) => {
      fetchMock.mockResolvedValueOnce(new Response(null, { status }));
      expect((await backendFetch("http://backend.test")).status).toBe(status);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );
  it.each(["POST", "PATCH", "DELETE"])(
    "não repete %s quando a resposta se perde",
    async (method) => {
      fetchMock.mockRejectedValue(new TypeError("offline"));
      await expect(
        backendFetch("http://backend.test", { method }),
      ).rejects.toThrow("offline");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );
  it("respeita cancelamento do chamador sem abrir outra tentativa", async () => {
    const controller = new AbortController();
    controller.abort();
    fetchMock.mockRejectedValue(new DOMException("cancelled", "AbortError"));
    await expect(
      backendFetch("http://backend.test", { signal: controller.signal }),
    ).rejects.toThrow("cancelled");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("limita falha de rede a duas tentativas de leitura", async () => {
    fetchMock.mockRejectedValue(new TypeError("offline"));
    await expect(backendFetch("http://backend.test")).rejects.toThrow(
      "offline",
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
describe("Mensagens públicas de erros", () => {
  const options = {
    context: "POST /transactions",
    fallback: "Não foi possível salvar.",
  };
  it.each([
    "PrismaClient error",
    "MongoDB ECONNREFUSED",
    "Internal Server Error",
  ])("oculta detalhe interno: %s", async (message) => {
    const error = await createApiError(
      Response.json({ message }, { status: 500 }),
      options,
    );
    expect(error.message).toBe(options.fallback);
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
      message,
    );
  });
  it("preserva orientação de negócio e mensagens públicas já normalizadas", async () => {
    const error = await createApiError(
      Response.json(
        { message: ["Saldo insuficiente.", "Escolha outro valor."] },
        { status: 400 },
      ),
      options,
    );
    expect(error.message).toContain("Saldo insuficiente");
    expect(createRequestError(error, options)).toBe(error);
    expect(
      createRequestError(new Error("token secreto"), options),
    ).toBeInstanceOf(PublicApiError);
    expect(
      createRequestError(new Error("token secreto"), options).message,
    ).toBe(options.fallback);
  });
  it.each([
    [401, "Sua sessão expirou"],
    [403, "Você não tem permissão"],
    [429, "Muitas tentativas"],
  ] as const)("oferece orientação para HTTP %s", async (status, message) => {
    expect(
      (
        await createApiError(
          new Response("<html>falha</html>", { status }),
          options,
        )
      ).message,
    ).toContain(message);
  });
});
