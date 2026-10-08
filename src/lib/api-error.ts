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

// Distingue uma mensagem pública já normalizada de uma exceção bruta de
// transporte/parsing. createRequestError preserva essa mensagem, em vez de
// substituí-la por outro fallback ao passar por catch de uma action.
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
  // Validações podem devolver um array de mensagens. Convertemos apenas texto
  // reconhecido, ignorando objetos/valores que não formam uma orientação pública.
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
  return fallback;
}

export async function createApiError(
  response: Response,
  { context, fallback }: ApiErrorOptions,
) {
  let body: ApiErrorBody | null = null;
  let rawBody: string | null = null;

  try {
    // Uma falha de gateway pode devolver HTML ou um body vazio. Ler como texto
    // e tentar JSON evita que o formato da resposta gere uma segunda exceção.
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
    // Em 5xx, o body pode citar banco, infraestrutura, bibliotecas ou stack.
    // Usamos somente o fallback público definido pela operação. Em outros
    // status, preservamos validações de negócio e usamos fallback se faltarem.
    response.status >= 500
      ? fallback
      : apiMessage ?? getStatusFallback(response.status, fallback);

  // O diagnóstico técnico fica no servidor e contém apenas contexto/status.
  // Não registramos o body financeiro, headers, cookies ou tokens da chamada.
  console.error(`[API] ${context} failed`, {
    status: response.status,
    statusText: response.statusText,
  });

  return new PublicApiError(publicMessage);
}

export function createRequestError(
  error: unknown,
  { context, fallback }: ApiErrorOptions,
) {
  // Uma resposta HTTP já tratada mantém sua mensagem pública. Erros brutos
  // (fetch, timeout, JSON, etc.) recebem o fallback da operação, sem error.message.
  if (isPublicApiError(error)) return error;

  console.error(`[API] ${context} could not be completed`);

  return new PublicApiError(fallback);
}
