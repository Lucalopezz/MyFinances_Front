"use server";

// Transporte compartilhado de exportações: GET/HEAD têm prazo e repetição
// limitada em falhas transitórias; gravações continuam com envio único. URL,
// cookie e Authorization são tratados no servidor pelos consumidores abaixo.
// A política completa fica em backend-fetch.ts, sem duplicar timers neste domínio.
import { backendFetch } from "@/lib/backend-fetch";

import { unstable_noStore as noStore } from "next/cache";

import {
  createApiError,
  createRequestError,
} from "@/lib/api-error";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";

export type TransactionExportStatusValue =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type TransactionExportFormat = "PDF" | "CSV";

export type TransactionExportStatus = {
  id: string | null;
  status: TransactionExportStatusValue;
  progress: number | null;
  error: string | null;
  format?: TransactionExportFormat;
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim();
  return normalized || null;
}

function getNestedRecord(record: JsonRecord, keys: string[]): JsonRecord {
  for (const key of keys) {
    const nested = record[key];
    if (isRecord(nested)) return nested;
  }

  return record;
}

function getExportRecord(payload: unknown): JsonRecord | null {
  if (!isRecord(payload)) return null;

  return getNestedRecord(payload, ["data", "export", "job", "latest"]);
}

function getExportId(record: JsonRecord): string | null {
  return (
    asNonEmptyString(record.id) ??
    asNonEmptyString(record.exportId) ??
    asNonEmptyString(record.jobId)
  );
}

function normalizeStatus(value: unknown):
  | TransactionExportStatusValue
  | "NOT_FOUND"
  | null {
  const status = asNonEmptyString(value)?.toUpperCase().replace(/[\s-]+/g, "_");

  if (!status) return null;
  if (["PENDING", "QUEUED", "WAITING"].includes(status)) return "PENDING";
  if (
    ["PROCESSING", "IN_PROGRESS", "GENERATING", "STARTED"].includes(status)
  ) {
    return "PROCESSING";
  }
  if (["COMPLETED", "COMPLETE", "DONE", "READY"].includes(status)) {
    return "COMPLETED";
  }
  if (["FAILED", "FAILURE", "ERROR"].includes(status)) return "FAILED";
  if (["NOT_FOUND", "NONE", "NO_EXPORT"].includes(status)) {
    return "NOT_FOUND";
  }

  return null;
}

function normalizeProgress(value: unknown): number | null {
  if (isRecord(value)) {
    return normalizeProgress(value.percentage ?? value.percent ?? value.value);
  }

  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value.replace("%", "").trim())
        : Number.NaN;

  if (!Number.isFinite(numberValue)) return null;

  const percentage =
    numberValue > 0 && numberValue <= 1 ? numberValue * 100 : numberValue;

  return Math.min(100, Math.max(0, Math.round(percentage)));
}

/**
 * O status assíncrono pode responder HTTP 200 e conter error de um worker.
 * Por isso, o filtro de 5xx em createApiError sozinho não cobre este caminho.
 * Preservamos a existência da falha, mas substituímos seu conteúdo técnico por
 * uma orientação pública. id/status/progress continuam sendo normalizados à parte.
 */
function getSafeError(record: JsonRecord): string | null {
  const error = record.error;

  if (typeof error === "string") {
    return asNonEmptyString(error)
      ? "Não foi possível gerar o arquivo. Tente novamente."
      : null;
  }
  if (isRecord(error)) {
    // Suporta os formatos legados { message } e { error }, sem enviar esses
    // valores brutos ao browser. Campo ausente/vazio continua representado por null.
    return asNonEmptyString(error.message) || asNonEmptyString(error.error)
      ? "Não foi possível gerar o arquivo. Tente novamente."
      : null;
  }

  return null;
}

function normalizeExportStatus(
  payload: unknown,
  fallbackId?: string | null,
): TransactionExportStatus | null {
  const record = getExportRecord(payload);
  if (!record) return null;

  const status = normalizeStatus(record.status ?? record.state);
  if (status === "NOT_FOUND") return null;

  const id = getExportId(record) ?? fallbackId ?? null;
  const hasExportData =
    Boolean(id) ||
    Boolean(status) ||
    "progress" in record ||
    "percentage" in record ||
    "percent" in record;

  if (!hasExportData) return null;

  return {
    id,
    status: status ?? (id ? "PENDING" : "FAILED"),
    progress: normalizeProgress(
      record.progress ?? record.percentage ?? record.percent,
    ),
    error: getSafeError(record),
    format: record.format === "CSV" ? "CSV" : "PDF",
  };
}

function getIdFromLocation(location: string | null): string | null {
  if (!location) return null;

  const parts = location.split("/").filter(Boolean);
  const lastPart = parts.at(-1);

  if (!lastPart) return null;

  try {
    return decodeURIComponent(lastPart);
  } catch {
    return lastPart;
  }
}

async function readJson(response: Response): Promise<unknown> {
  const body = await response.text();
  if (!body) return null;

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

export async function createTransactionExport(
  format: TransactionExportFormat = "PDF",
): Promise<TransactionExportStatus> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const response = await backendFetch(`${backendUrl}/exports/transactions`, {
      method: "POST",
      headers: createJsonHeaders(token),
      body: JSON.stringify(format === "PDF" ? {} : { format }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw await createApiError(response, {
        context: "POST /exports/transactions",
        fallback: "Não foi possível iniciar a exportação das transações.",
      });
    }

    const payload = await readJson(response);
    const normalized = normalizeExportStatus(
      payload,
      getIdFromLocation(response.headers.get("location")),
    );

    if (normalized) return { ...normalized, format };

    return {
      id: getIdFromLocation(response.headers.get("location")),
      status: "PENDING",
      progress: 0,
      error: null,
      format,
    };
  } catch (error) {
    throw createRequestError(error, {
      context: "POST /exports/transactions",
      fallback: "Não foi possível iniciar a exportação das transações.",
    });
  }
}

export async function getTransactionExportStatus(): Promise<TransactionExportStatus | null> {
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  try {
    const response = await backendFetch(`${backendUrl}/exports/status`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
    });

    if (response.status === 404) return null;

    if (!response.ok) {
      throw await createApiError(response, {
        context: "GET /exports/status",
        fallback: "Não foi possível consultar o status da exportação.",
      });
    }

    return normalizeExportStatus(await readJson(response));
  } catch (error) {
    throw createRequestError(error, {
      context: "GET /exports/status",
      fallback: "Não foi possível consultar o status da exportação.",
    });
  }
}
