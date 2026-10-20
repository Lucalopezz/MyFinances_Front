import { createApiError, createRequestError } from "@/lib/api-error";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import {
  normalizeTransactionExportFormat,
  TRANSACTION_EXPORT_FORMATS,
} from "@/models/transaction-export";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** O navegador recebe só o arquivo; o token segue apenas entre os servidores. */
export async function GET(request: Request) {
  const token = await getServerToken();
  if (!token) {
    return new Response("Sua sessão expirou. Entre novamente.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const format = normalizeTransactionExportFormat(
    new URL(request.url).searchParams.get("format"),
  );

  try {
    const response = await fetch(
      `${getServerBackendUrl()}/exports/transactions/direct`,
      {
        method: "POST",
        headers: createJsonHeaders(token),
        body: JSON.stringify({ format }),
        cache: "no-store",
        signal: AbortSignal.timeout(280_000),
      },
    );

    if (!response.ok) {
      const error = await createApiError(response, {
        context: "POST /exports/transactions/direct",
        fallback: "Não foi possível gerar a exportação. Tente novamente.",
      });
      return new Response(error.message, {
        status: response.status,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const headers = new Headers({
      "Content-Type":
        response.headers.get("content-type") ??
        TRANSACTION_EXPORT_FORMATS[format].contentType,
      "Content-Disposition":
        response.headers.get("content-disposition") ??
        `attachment; filename="transacoes.${format.toLowerCase()}"`,
      "Cache-Control": "private, no-store",
    });
    const length = response.headers.get("content-length");
    if (length) headers.set("Content-Length", length);
    // Repassa o stream sem carregar o histórico financeiro inteiro no Next.
    return new Response(response.body, { headers });
  } catch (error) {
    const publicError = createRequestError(error, {
      context: "POST /exports/transactions/direct",
      fallback: "Não foi possível gerar a exportação. Tente novamente.",
    });
    return new Response(publicError.message, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
