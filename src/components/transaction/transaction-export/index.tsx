"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileDown,
  LoaderCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  createTransactionExport,
  getTransactionExportStatus,
  type TransactionExportStatus,
} from "@/actions/export/transactions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const POLLING_INTERVAL = 2500;
const DOWNLOADED_EXPORTS_KEY = "myfinances:downloaded-transaction-exports";

function isActiveExport(
  exportStatus: TransactionExportStatus | null,
): boolean {
  return (
    exportStatus?.status === "PENDING" || exportStatus?.status === "PROCESSING"
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Não foi possível consultar a exportação.";
}

function hasDownloadedExport(exportId: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const storedExports = JSON.parse(
      window.sessionStorage.getItem(DOWNLOADED_EXPORTS_KEY) ?? "[]",
    ) as unknown;

    return (
      Array.isArray(storedExports) &&
      storedExports.some((storedId) => storedId === exportId)
    );
  } catch {
    return false;
  }
}

function rememberDownloadedExport(exportId: string): void {
  if (typeof window === "undefined") return;

  try {
    const storedExports = JSON.parse(
      window.sessionStorage.getItem(DOWNLOADED_EXPORTS_KEY) ?? "[]",
    ) as unknown;
    const exportIds = Array.isArray(storedExports)
      ? storedExports.filter((storedId): storedId is string =>
          typeof storedId === "string",
        )
      : [];

    if (!exportIds.includes(exportId)) {
      window.sessionStorage.setItem(
        DOWNLOADED_EXPORTS_KEY,
        JSON.stringify([...exportIds, exportId]),
      );
    }
  } catch {
    // O download continua funcionando mesmo quando o storage está indisponível.
  }
}

export function TransactionExport() {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [exportStatus, setExportStatus] =
    useState<TransactionExportStatus | null>(null);
  const previousStatus = useRef<TransactionExportStatus["status"] | null>(null);

  const refreshStatus = useCallback(async () => {
    const latestStatus = await getTransactionExportStatus();
    if (latestStatus) setExportStatus(latestStatus);
    return latestStatus;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadStatus = async () => {
      try {
        const latestStatus = await getTransactionExportStatus();
        const alreadyDownloaded =
          latestStatus?.status === "COMPLETED" &&
          Boolean(latestStatus.id) &&
          hasDownloadedExport(latestStatus.id as string);

        if (!cancelled && latestStatus && !alreadyDownloaded) {
          setExportStatus(latestStatus);
        }
      } catch (error) {
        if (!cancelled) setStatusError(getErrorMessage(error));
      } finally {
        if (!cancelled) setIsCheckingStatus(false);
      }
    };

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isCreating || !isActiveExport(exportStatus)) return;

    let cancelled = false;

    const pollStatus = async () => {
      try {
        const latestStatus = await refreshStatus();
        if (!cancelled && latestStatus) setStatusError(null);
      } catch (error) {
        if (cancelled) return;

        const message = getErrorMessage(error);
        setStatusError(message);
        setExportStatus((currentStatus) =>
          currentStatus
            ? { ...currentStatus, status: "FAILED", error: message }
            : currentStatus,
        );
        toast.error(message);
      }
    };

    const intervalId = window.setInterval(() => {
      void pollStatus();
    }, POLLING_INTERVAL);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [exportStatus, isCreating, refreshStatus]);

  useEffect(() => {
    const currentStatus = exportStatus?.status ?? null;

    if (
      previousStatus.current &&
      previousStatus.current !== "COMPLETED" &&
      currentStatus === "COMPLETED"
    ) {
      toast.success("Seu PDF está pronto para baixar.");
    }

    previousStatus.current = currentStatus;
  }, [exportStatus?.status]);

  const handleConfirmExport = async () => {
    setIsConfirmationOpen(false);
    setIsCreating(true);
    setStatusError(null);
    setExportStatus({
      id: null,
      status: "PENDING",
      progress: 0,
      error: null,
    });

    try {
      const createdExport = await createTransactionExport();
      setExportStatus(createdExport);
    } catch (error) {
      const message = getErrorMessage(error);
      setStatusError(message);
      setExportStatus(null);
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const isCompleted = exportStatus?.status === "COMPLETED";
  const isFailed = exportStatus?.status === "FAILED";
  const progress = exportStatus?.progress;
  const exportId = exportStatus?.id;

  const handleDownload = () => {
    // O download acontece pelo link; ao mesmo tempo, liberamos a criação de
    // uma nova exportação sem esperar o status anterior sair da API.
    if (exportId) rememberDownloadedExport(exportId);
    setExportStatus(null);
    setStatusError(null);
    previousStatus.current = null;
  };

  const renderAction = () => {
    if (isCheckingStatus) {
      return (
        <Button type="button" variant="outline" disabled>
          <LoaderCircle className="animate-spin" aria-hidden="true" />
          Verificando exportação...
        </Button>
      );
    }

    if (isCompleted && exportId) {
      return (
        <Button type="button" variant="outline" asChild>
          <a
            href={`/api/exports/transactions/${encodeURIComponent(exportId)}/download`}
            download="transacoes.pdf"
            onClick={handleDownload}
          >
            <Download aria-hidden="true" />
            Baixar PDF
          </a>
        </Button>
      );
    }

    if (isCreating || isActiveExport(exportStatus)) {
      const progressLabel =
        progress === null || progress === undefined
          ? "Gerando PDF..."
          : `Gerando PDF... ${progress}%`;

      return (
        <Button type="button" variant="outline" disabled>
          <LoaderCircle className="animate-spin" aria-hidden="true" />
          {progressLabel}
        </Button>
      );
    }

    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsConfirmationOpen(true)}
      >
        <FileDown aria-hidden="true" />
        {isFailed ? "Tentar exportar PDF" : "Exportar PDF"}
      </Button>
    );
  };

  const helperMessage = isCompleted
    ? "PDF pronto para baixar."
    : isFailed
      ? exportStatus.error ?? statusError ?? "A exportação falhou."
      : isActiveExport(exportStatus)
        ? "A exportação inclui todas as transações e pode demorar."
        : statusError;

  return (
    <div className="flex flex-col items-start gap-1 lg:items-end">
      {renderAction()}
      {helperMessage ? (
        <p
          className={`max-w-xs text-right text-xs ${
            isFailed || statusError
              ? "text-red-600 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
          aria-live="polite"
        >
          {isFailed || statusError ? (
            <AlertCircle className="mr-1 inline size-3.5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="mr-1 inline size-3.5" aria-hidden="true" />
          )}
          {helperMessage}
        </p>
      ) : null}

      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar transações em PDF?</DialogTitle>
            <DialogDescription className="pt-2 leading-relaxed">
              O arquivo terá todas as suas transações, não apenas as exibidas
              nesta página ou pelos filtros atuais. A geração acontece em
              segundo plano e pode demorar um pouco.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmationOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={() => void handleConfirmExport()}>
              Confirmar exportação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
