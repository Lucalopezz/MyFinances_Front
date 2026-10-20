import { createApiError, createRequestError } from "@/lib/api-error";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import {
  normalizeTransactionExportFormat,
  defaultExportFilename,
  TRANSACTION_EXPORT_FORMATS,
} from "@/models/transaction-export";

export const dynamic = "force-dynamic";

type DownloadRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: DownloadRouteContext) {
  const { id } = await params;
  // O formato do link serve como fallback de cabeçalhos. O arquivo continua
  // sendo escolhido pelo registro autenticado da API, não por esse parâmetro.
  const format = normalizeTransactionExportFormat(
    new URL(request.url).searchParams.get("format"),
  );

  if (!id) {
    return Response.json(
      { message: "Identificador da exportação não informado." },
      { status: 400 },
    );
  }

  const token = await getServerToken();
  if (!token) {
    return Response.json(
      { message: "Sua sessão expirou. Entre novamente." },
      { status: 401 },
    );
  }

  try {
    const backendUrl = getServerBackendUrl();
    const response = await fetch(
      `${backendUrl}/exports/${encodeURIComponent(id)}/download`,
      {
        headers: createJsonHeaders(token),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const error = await createApiError(response, {
        context: `GET /exports/${id}/download`,
        fallback: "Não foi possível baixar a exportação.",
      });

      return Response.json(
        { message: error.message },
        { status: response.status },
      );
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      response.headers.get("content-type") ??
        TRANSACTION_EXPORT_FORMATS[format].contentType,
    );
    headers.set(
      "Content-Disposition",
      response.headers.get("content-disposition") ??
        `attachment; filename="${defaultExportFilename(format)}"`,
    );

    const contentLength = response.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new Response(response.body, { headers });
  } catch (error) {
    const publicError = createRequestError(error, {
      context: `GET /exports/${id}/download`,
      fallback: "Não foi possível baixar a exportação.",
    });

    return Response.json({ message: publicError.message }, { status: 500 });
  }
}
