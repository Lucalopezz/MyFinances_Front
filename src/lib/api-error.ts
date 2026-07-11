import "server-only";

type ApiErrorOptions = {
  context: string;
  fallback: string;
};

type ApiErrorBody = {
  message?: unknown;
  error?: unknown;
  details?: unknown;
};

// create a custom error class to represent public API errors
export class PublicApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicApiError";
  }
}

export function isPublicApiError(error: unknown): error is PublicApiError {
  return error instanceof Error && error.name === "PublicApiError";
}

function asMessage(value: unknown): string | null {
  //  Validate if the value is an array of messages and join them into a single string.
  if (Array.isArray(value)) {
    const messages = value
      .map(asMessage)
      .filter((message): message is string => Boolean(message));
    return messages.length > 0 ? messages.join(". ") : null;
  }

  if (typeof value !== "string") return null;

  const message = value.trim().replace(/\s+/g, " ");
  return message ? message : null;
}

function getStatusFallback(status: number, fallback: string) {
  if (status === 401) return "Sua sessão expirou. Entre novamente.";
  if (status === 403) return "Você não tem permissão para realizar esta ação.";
  if (status === 429)
    return "Muitas tentativas. Aguarde um momento e tente novamente.";
  if (status >= 500)
    return "O serviço está indisponível no momento. Tente novamente mais tarde.";
  return fallback;
}

export async function createApiError(
  response: Response,
  { context, fallback }: ApiErrorOptions,
) {
  let body: ApiErrorBody | null = null;
  let rawBody: string | null = null;

  try {
    rawBody = await response.text();
    body = rawBody ? (JSON.parse(rawBody) as ApiErrorBody) : null;
  } catch {
    body = null;
  }

  const apiMessage =
    asMessage(body?.message) ??
    asMessage(body?.error) ??
    asMessage(body?.details);
  const publicMessage =
    apiMessage ?? getStatusFallback(response.status, fallback);

  console.error(`[API] ${context} failed`, {
    status: response.status,
    statusText: response.statusText,
    apiMessage:
      apiMessage ??
      (rawBody ? "Resposta não estruturada recebida" : "Sem mensagem"),
    publicMessage,
  });

  return new PublicApiError(publicMessage);
}

export function createRequestError(
  error: unknown,
  { context, fallback }: ApiErrorOptions,
) {
  if (isPublicApiError(error)) return error;

  console.error(`[API] ${context} could not be completed`, {
    cause: error instanceof Error ? error.message : String(error),
  });

  return new PublicApiError(fallback);
}
