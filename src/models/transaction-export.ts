// O formato retornado pela API também define o nome e o tipo do download.
// Manter esse contrato fora das Server Actions permite reutilizá-lo na tela
// e na rota autenticada, sem importar funções de servidor no navegador.
export const TRANSACTION_EXPORT_FORMATS = {
  PDF: {
    label: "PDF",
    option: "PDF para leitura e impressão",
    contentType: "application/pdf",
  },
  CSV: {
    label: "CSV",
    option: "Abrir no Excel (.csv)",
    contentType: "text/csv; charset=utf-8",
  },
  XLSX: {
    label: "Excel (.xlsx)",
    option: "Excel nativo (.xlsx)",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
} as const;

export type TransactionExportFormat = keyof typeof TRANSACTION_EXPORT_FORMATS;

export type TransactionExportStatusValue =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type TransactionExportStatus = {
  id: string | null;
  status: TransactionExportStatusValue;
  progress: number | null;
  error: string | null;
  format?: TransactionExportFormat;
};

/**
 * Reconhece os três formatos e preserva PDF para respostas legadas sem formato.
 * A mesma regra mantém status, seleção e cabeçalhos de download consistentes.
 */
export function normalizeTransactionExportFormat(
  value: unknown,
): TransactionExportFormat {
  return value === "CSV" || value === "XLSX" ? value : "PDF";
}
