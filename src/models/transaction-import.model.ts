export type ImportRow = {
  rowId: number;
  date?: string;
  description?: string;
  value?: number;
  type?: "INCOME" | "EXPENSE";
  category: string | null;
  categorySource: "manual" | "rule" | "default" | null;
  ruleId: string | null;
  externalId?: string;
  errors: string[];
  categoryError?: boolean;
  duplicates: {
    kind: "FILE" | "HISTORY";
    reason: "EXTERNAL_ID" | "FINGERPRINT";
    rowId?: number;
    transactionId?: string;
  }[];
  selected: boolean;
};
export type ImportLineResult = {
  rowId: number;
  status: "IMPORTED" | "IGNORED" | "REJECTED" | "PENDING";
  reason: string | null;
  transactionId: string | null;
};
export type ImportSummary = {
  imported: number;
  ignored: number;
  rejected: number;
  pending: number;
};
export type ImportPreview = {
  batchId: string;
  expiresAt: string;
  rows: ImportRow[];
  expired?: boolean;
  results?: ImportLineResult[];
  summary?: ImportSummary;
};
export type ImportResult = {
  batchId: string;
  results: ImportLineResult[];
  summary: ImportSummary;
  recalculationPending?: boolean;
};
export type ImportChoice = {
  rowId: number;
  selected: boolean;
  category?: string;
  allowDuplicate: boolean;
};
export type ImportActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };
