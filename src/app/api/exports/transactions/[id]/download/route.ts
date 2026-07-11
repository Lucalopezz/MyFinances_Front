import { createApiError, createRequestError } from "@/lib/api-error";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

type DownloadRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: DownloadRouteContext,
) {
  const { id } = await params;

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
        fallback: "Não foi possível baixar o PDF da exportação.",
      });

      return Response.json(
        { message: error.message },
        { status: response.status },
      );
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      response.headers.get("content-type") ?? "application/pdf",
    );
    headers.set(
      "Content-Disposition",
      response.headers.get("content-disposition") ??
        'attachment; filename="transacoes.pdf"',
    );

    const contentLength = response.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new Response(response.body, { headers });
  } catch (error) {
    const publicError = createRequestError(error, {
      context: `GET /exports/${id}/download`,
      fallback: "Não foi possível baixar o PDF da exportação.",
    });

    return Response.json(
      { message: publicError.message },
      { status: 500 },
    );
  }
}
