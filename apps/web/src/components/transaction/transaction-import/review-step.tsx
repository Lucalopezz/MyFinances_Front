"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/providers/category-provider";
import type {
  ImportChoice,
  ImportLineResult,
  ImportRow,
} from "@/models/transaction-import.model";
import { selectClass } from "./file-step";

export function canImport(
  row: ImportRow,
  choice: ImportChoice,
  categories: ReturnType<typeof useCategories>["categories"],
) {
  return (
    !!row.date &&
    !!row.type &&
    !!row.value &&
    (!row.errors.length || !!row.categoryError) &&
    categories.some(
      (c) => c.id === choice.category && c.type === row.type && !c.archived,
    ) &&
    (!row.duplicates.length || choice.allowDuplicate)
  );
}
export const importReasons: Record<string, string> = {
  NOT_SELECTED: "Linha desmarcada",
  DUPLICATE_REQUIRES_APPROVAL:
    "Possível duplicata: confirme se deseja importar",
  INVALID_CATEGORY: "Escolha uma categoria ativa e compatível",
  INVALID_ROW: "Dados inválidos: corrija o arquivo e gere outra prévia",
  RETRY_REQUIRED: "Falha temporária: tente novamente",
  EXPIRED_OR_CANCELLED: "Prévia expirada ou descartada",
  NOT_PROCESSED: "Aguardando confirmação",
};

export function ImportReviewStep({
  rows,
  choices,
  results,
  busy,
  onChange,
}: {
  rows: ImportRow[];
  choices: Record<number, ImportChoice>;
  results: ImportLineResult[];
  busy: boolean;
  onChange: (choices: Record<number, ImportChoice>) => void;
}) {
  const { categories, categoryOptions } = useCategories();
  const [page, setPage] = useState(0);
  const [bulkCategory, setBulkCategory] = useState("");
  const imported = new Set(
    results.filter((r) => r.status === "IMPORTED").map((r) => r.rowId),
  );
  const pageCount = Math.ceil(rows.length / 20);
  const update = (rowId: number, patch: Partial<ImportChoice>) =>
    onChange({ ...choices, [rowId]: { ...choices[rowId], ...patch } });
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Revise os valores e as categorias. Possíveis duplicatas começam
        desmarcadas. Corrigir a categoria não altera transações antigas.
      </p>
      <fieldset disabled={busy} className="min-w-0 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() =>
              onChange(
                Object.fromEntries(
                  rows.map((row) => [
                    row.rowId,
                    {
                      ...choices[row.rowId],
                      selected:
                        !imported.has(row.rowId) &&
                        canImport(row, choices[row.rowId], categories),
                    },
                  ]),
                ),
              )
            }
          >
            Selecionar válidas
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() =>
              onChange(
                Object.fromEntries(
                  rows.map((row) => [
                    row.rowId,
                    { ...choices[row.rowId], selected: false },
                  ]),
                ),
              )
            }
          >
            Desmarcar todas
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 text-sm">
            Categoria em lote
            <select
              aria-label="Categoria em lote"
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className={selectClass}
            >
              <option value="">Escolha uma categoria</option>
              {categories
                .filter((c) => !c.archived)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.type === "EXPENSE" ? "Despesa" : "Receita"} — {c.name}
                  </option>
                ))}
            </select>
          </label>
          <Button
            variant="outline"
            type="button"
            disabled={!bulkCategory}
            onClick={() => {
              const category = categories.find((c) => c.id === bulkCategory);
              onChange(
                Object.fromEntries(
                  rows.map((row) => [
                    row.rowId,
                    {
                      ...choices[row.rowId],
                      ...(choices[row.rowId].selected &&
                      !imported.has(row.rowId) &&
                      row.type === category?.type
                        ? { category: bulkCategory }
                        : {}),
                    },
                  ]),
                ),
              );
            }}
          >
            Aplicar às selecionadas
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          A categoria em lote só altera linhas do mesmo tipo (receita ou
          despesa).
        </p>
        <ul className="space-y-3" aria-label="Linhas do extrato">
          {rows.slice(page * 20, (page + 1) * 20).map((row) => {
            const choice = choices[row.rowId];
            const done = imported.has(row.rowId);
            const lastResult = results.find(
              (result) => result.rowId === row.rowId,
            );
            const valid = canImport(row, choice, categories);
            const categoryFixed =
              row.categoryError &&
              categories.some(
                (c) =>
                  c.id === choice.category &&
                  c.type === row.type &&
                  !c.archived,
              );
            return (
              <li
                key={row.rowId}
                className="rounded-lg border p-3"
                data-import-row={row.rowId}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 shrink-0"
                    aria-label={`Selecionar linha ${row.rowId}`}
                    checked={choice.selected && !done && valid}
                    disabled={done || !valid}
                    onChange={(e) =>
                      update(row.rowId, { selected: e.target.checked })
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-xs text-muted-foreground">
                          Linha {row.rowId} ·{" "}
                          {row.date?.split("-").reverse().join("/") ??
                            "Data inválida"}
                        </span>
                        <p className="break-words text-sm font-medium">
                          {row.description ?? "Registro inválido"}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold">
                        {row.type === "EXPENSE" ? "− " : "+ "}
                        {row.value?.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }) ?? "—"}
                      </p>
                    </div>
                    {done ? (
                      <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                        Já importada
                      </p>
                    ) : (
                      <>
                        {row.type && (
                          <label className="mt-2 block text-sm">
                            Categoria da linha {row.rowId}
                            <select
                              aria-label={`Categoria da linha ${row.rowId}`}
                              className={selectClass}
                              value={choice.category ?? ""}
                              onChange={(e) =>
                                update(row.rowId, {
                                  category: e.target.value || undefined,
                                })
                              }
                            >
                              <option value="">Selecione uma categoria</option>
                              {choice.category &&
                                !categoryOptions(row.type).some(
                                  (c) => c.id === choice.category,
                                ) && (
                                  <option value={choice.category} disabled>
                                    Categoria indisponível — escolha outra
                                  </option>
                                )}
                              {categoryOptions(row.type).map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                        {row.categorySource === "rule" && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Categoria sugerida por uma regra automática.
                          </p>
                        )}
                        {!!row.errors.length && !categoryFixed && (
                          <ul className="mt-2 text-sm text-red-600 dark:text-red-400">
                            {row.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        )}
                        {lastResult?.reason &&
                          lastResult.status !== "IGNORED" && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Última tentativa:{" "}
                              {importReasons[lastResult.reason] ??
                                "Revise esta linha."}
                            </p>
                          )}
                        {row.duplicates.length > 0 && (
                          <div className="mt-2 rounded-md bg-amber-50 p-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                            <p>
                              Possível duplicata{" "}
                              {row.duplicates.some((d) => d.kind === "HISTORY")
                                ? "no histórico"
                                : "neste arquivo"}
                              .
                              {row.duplicates.some((d) => d.kind === "FILE") &&
                                ` Linhas relacionadas: ${row.duplicates
                                  .filter((d) => d.kind === "FILE")
                                  .map((d) => d.rowId)
                                  .join(", ")}.`}
                            </p>
                            <label className="mt-2 flex items-start gap-2">
                              <input
                                className="mt-1"
                                type="checkbox"
                                checked={choice.allowDuplicate}
                                onChange={(e) =>
                                  update(row.rowId, {
                                    allowDuplicate: e.target.checked,
                                    selected: false,
                                  })
                                }
                              />
                              É uma movimentação distinta; permitir importar
                              mesmo assim
                            </label>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {pageCount > 1 && (
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!page}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <span className="text-xs">
              Página {page + 1} de {pageCount}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page + 1 >= pageCount}
              onClick={() => setPage(page + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </fieldset>
    </div>
  );
}
