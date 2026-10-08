"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  previewImport,
  confirmImport,
  getImport,
  discardImport,
} from "@/actions/transaction/import-transactions";
import { useCategories } from "@/providers/category-provider";
import { notifySessionExpired } from "@/lib/client-auth";
import type {
  ImportActionResult,
  ImportChoice,
  ImportPreview,
  ImportResult,
} from "@/models/transaction-import.model";
import { ImportFileStep } from "./file-step";
import { canImport, ImportReviewStep, importReasons } from "./review-step";

type Step = "file" | "review" | "confirm" | "result" | "discard";
function unwrap<T>(result: ImportActionResult<T>): T {
  if (result.ok) return result.data;
  if (result.status === 401) notifySessionExpired();
  throw new Error(result.error);
}
function rememberBatch(id?: string) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("importBatch", id);
  else url.searchParams.delete("importBatch");
  // Only an opaque batch identifier is persisted, never financial data or a JWT.
  window.history.replaceState(null, "", url.toString());
}
const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function TransactionImport() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("file");
  const [batch, setBatch] = useState<ImportPreview | null>(null);
  const [choices, setChoices] = useState<Record<number, ImportChoice>>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const lock = useRef(false);
  const initialized = useRef(false);
  const { categories } = useCategories();
  const queryClient = useQueryClient();
  const router = useRouter();
  const imported = new Set(
    (result?.results ?? batch?.results ?? [])
      .filter((r) => r.status === "IMPORTED")
      .map((r) => r.rowId),
  );
  const expired =
    !!batch && (!!batch.expired || Date.parse(batch.expiresAt) <= now);
  const selected =
    batch?.rows.filter(
      (r) =>
        !imported.has(r.rowId) &&
        choices[r.rowId]?.selected &&
        canImport(r, choices[r.rowId], categories),
    ) ?? [];

  async function run(work: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir. Tente novamente.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
      setNow(Date.now());
    }
  }
  function loadBatch(data: ImportPreview, preserve = false) {
    setBatch(data);
    const done = new Set(
      data.results?.filter((r) => r.status === "IMPORTED").map((r) => r.rowId),
    );
    setChoices((current) =>
      Object.fromEntries(
        data.rows.map((r) => [
          r.rowId,
          {
            rowId: r.rowId,
            category: r.category ?? undefined,
            allowDuplicate: false,
            selected: r.selected,
            ...(preserve ? current[r.rowId] : {}),
            ...(done.has(r.rowId) ? { selected: false } : {}),
          },
        ]),
      ),
    );
  }
  async function refreshViews() {
    await Promise.all(
      ["transactions", "dashboard", "budgets", "wishlist"].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      ),
    );
    router.refresh();
  }
  async function refreshBatch() {
    if (!batch) return;
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
    const data = unwrap(await getImport(batch.batchId));
    loadBatch(data, true);
    if (data.summary && data.results)
      setResult({
        batchId: data.batchId,
        summary: data.summary,
        results: data.results,
        recalculationPending: result?.recalculationPending,
      });
    await refreshViews();
  }
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const id = new URL(window.location.href).searchParams.get("importBatch");
    if (!id) return;
    setOpen(true);
    void run(async () => {
      const response = await getImport(id);
      if (!response.ok) {
        rememberBatch();
        unwrap(response);
        return;
      }
      loadBatch(response.data);
      if (
        response.data.results?.some((r) => r.status === "IMPORTED") ||
        response.data.expired
      ) {
        setResult({
          batchId: id,
          results: response.data.results ?? [],
          summary: response.data.summary ?? {
            imported: 0,
            ignored: 0,
            rejected: 0,
            pending: 0,
          },
        });
        setStep("result");
      } else setStep("review");
    });
    // Recovery runs once on mount. Further refreshes are explicit to preserve edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!open || !batch) return;
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, [open, batch]);

  async function confirm(totalsOnly = false) {
    if (!batch) return;
    try {
      const data = unwrap(
        await confirmImport(
          batch.batchId,
          totalsOnly
            ? []
            : batch.rows.map((row) => ({
                ...choices[row.rowId],
                selected:
                  !imported.has(row.rowId) &&
                  !!choices[row.rowId]?.selected &&
                  canImport(row, choices[row.rowId], categories),
              })),
        ),
      );
      setResult(data);
      setStep("result");
    } finally {
      await refreshViews();
    }
  }
  const resultLabels = {
    IMPORTED: "Importada",
    IGNORED: "Ignorada",
    REJECTED: "Rejeitada",
    PENDING: "Pendente",
  };
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setNow(Date.now());
          setOpen(true);
        }}
      >
        <Upload className="size-4" aria-hidden="true" />
        Importar
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!lock.current) setOpen(value);
        }}
      >
        <DialogContent
          className="flex max-h-[90dvh] w-[calc(100vw-2rem)] flex-col overflow-hidden sm:max-w-3xl"
          onInteractOutside={(event) => event.preventDefault()}
          aria-busy={busy}
        >
          <DialogHeader>
            <DialogTitle>
              {step === "result"
                ? "Resultado da importação"
                : "Importar extrato"}
            </DialogTitle>
            <DialogDescription>
              {step === "file"
                ? "Envie um CSV ou OFX e confira a prévia antes de salvar."
                : step === "review"
                  ? "Revise as linhas e escolha quais transações deseja importar."
                  : step === "confirm"
                    ? "Confirme os lançamentos que serão adicionados ao seu histórico."
                    : step === "discard"
                      ? "Descartar a prévia remove apenas os dados temporários."
                      : "Cada linha mostra o que foi gravado e o que ainda precisa de atenção."}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-1">
            {busy && (
              <p role="status" className="text-sm text-muted-foreground">
                Processando, aguarde…
              </p>
            )}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-300 p-3 text-sm text-red-700 dark:text-red-300"
              >
                <p>{error}</p>
                {batch && (
                  <Button
                    variant="outline"
                    className="mt-2"
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        await refreshBatch();
                        setStep("result");
                      })
                    }
                  >
                    Consultar resultado
                  </Button>
                )}
              </div>
            )}
            {expired && (
              <p
                role="alert"
                className="rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
              >
                Esta prévia expirou ou foi descartada. As transações já
                importadas foram preservadas. Envie o arquivo novamente para
                continuar.
              </p>
            )}
            {step === "file" && (
              <ImportFileStep
                busy={busy}
                onPreview={(file, options) =>
                  run(async () => {
                    const form = new FormData();
                    form.set("file", file);
                    form.set("options", JSON.stringify(options));
                    const data = unwrap(await previewImport(form));
                    loadBatch(data);
                    setResult(null);
                    rememberBatch(data.batchId);
                    setStep("review");
                  })
                }
              />
            )}
            {step === "review" && batch && !expired && (
              <>
                <p className="text-xs text-muted-foreground">
                  {batch.rows.length} registros · prévia disponível até{" "}
                  {new Date(batch.expiresAt).toLocaleString("pt-BR")}
                </p>
                <ImportReviewStep
                  rows={batch.rows}
                  choices={choices}
                  results={result?.results ?? batch.results ?? []}
                  busy={busy}
                  onChange={setChoices}
                />
                <p role="status" className="text-sm font-medium">
                  {selected.length} de {batch.rows.length} linhas selecionadas
                </p>
              </>
            )}
            {step === "confirm" && (
              <div className="space-y-3 rounded-lg border p-4">
                <h3 className="font-semibold">
                  Importar {selected.length}{" "}
                  {selected.length === 1 ? "transação" : "transações"}?
                </h3>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt>Receitas</dt>
                  <dd className="text-right">
                    {money(
                      selected
                        .filter((r) => r.type === "INCOME")
                        .reduce((sum, r) => sum + (r.value ?? 0), 0),
                    )}
                  </dd>
                  <dt>Despesas</dt>
                  <dd className="text-right">
                    {money(
                      selected
                        .filter((r) => r.type === "EXPENSE")
                        .reduce((sum, r) => sum + (r.value ?? 0), 0),
                    )}
                  </dd>
                </dl>
                {selected.some((r) => r.duplicates.length) && (
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Você autorizou importar{" "}
                    {selected.filter((r) => r.duplicates.length).length}{" "}
                    possíveis duplicatas como movimentações distintas.
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Somente as linhas selecionadas e válidas serão importadas.
                  Confira as categorias e possíveis duplicatas antes de confirmar.
                </p>
              </div>
            )}
            {step === "result" && result && (
              <div className="space-y-4">
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(
                    [
                      ["imported", "Importadas"],
                      ["ignored", "Ignoradas"],
                      ["rejected", "Rejeitadas"],
                      ["pending", "Pendentes"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="rounded-lg border p-3">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="text-2xl font-semibold">
                        {result.summary[key]}
                      </dd>
                    </div>
                  ))}
                </dl>
                {result.recalculationPending && (
                  <p
                    role="alert"
                    className="text-sm text-amber-700 dark:text-amber-300"
                  >
                    As transações foram salvas, mas o progresso da wishlist
                    ainda precisa ser atualizado. Tente atualizar os totais
                    abaixo.
                  </p>
                )}
                <div className="max-h-72 overflow-y-auto rounded-lg border">
                  <ul className="divide-y">
                    {result.results.map((line) => (
                      <li key={line.rowId} className="p-3 text-sm">
                        <span className="font-medium">
                          Linha {line.rowId}: {resultLabels[line.status]}
                        </span>
                        {line.reason && (
                          <p className="mt-1 text-muted-foreground">
                            {importReasons[line.reason] ??
                              "Confira esta linha antes de continuar."}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                {result.summary.imported > 0 && (
                  <p className="text-sm text-green-700 dark:text-green-400">
                    As transações importadas já aparecem no seu histórico e nos
                    resumos.
                  </p>
                )}
              </div>
            )}
            {step === "discard" && (
              <p className="text-sm">
                Descartar esta prévia? Para retomá-la, será necessário enviar o
                arquivo novamente. Transações já importadas continuam no
                histórico.
              </p>
            )}
          </div>
          <DialogFooter className="shrink-0 flex-wrap">
            {step === "file" && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Fechar
              </Button>
            )}
            {(step === "review" || step === "result" || expired) && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setStep("discard")}
              >
                Descartar prévia
              </Button>
            )}
            {step === "review" && !expired && (
              <Button
                disabled={busy || !selected.length}
                onClick={() => setStep("confirm")}
              >
                Revisar confirmação ({selected.length})
              </Button>
            )}
            {step === "confirm" && (
              <>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setStep("review")}
                >
                  Voltar à revisão
                </Button>
                <Button
                  disabled={busy || expired || !selected.length}
                  onClick={() => void run(confirm)}
                >
                  Confirmar importação
                </Button>
              </>
            )}
            {step === "result" && !expired && result && (
              <>
                {result.recalculationPending && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => void run(() => confirm(true))}
                  >
                    Atualizar totais
                  </Button>
                )}
                {(result.summary.pending > 0 ||
                  result.summary.rejected > 0 ||
                  result.summary.ignored > 0) && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        await refreshBatch();
                        setStep("review");
                      })
                    }
                  >
                    Revisar pendências
                  </Button>
                )}
                <Button disabled={busy} onClick={() => setOpen(false)}>
                  Fechar
                </Button>
              </>
            )}
            {step === "discard" && (
              <>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setStep(result ? "result" : "review")}
                >
                  Manter prévia
                </Button>
                <Button
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      if (batch) unwrap(await discardImport(batch.batchId));
                      setBatch(null);
                      setResult(null);
                      setChoices({});
                      rememberBatch();
                      setStep("file");
                    })
                  }
                >
                  Confirmar descarte
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
