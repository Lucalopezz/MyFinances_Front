"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  normalizeTransactionExportFormat,
  TRANSACTION_EXPORT_FORMATS,
  type TransactionExportFormat,
} from "@/models/transaction-export";

/** Download direto: a resposta só começa após o arquivo estar completo. */
export function DirectTransactionExport() {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<TransactionExportFormat>("PDF");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-1 lg:items-end">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setMessage(null);
          setOpen(true);
        }}
      >
        <FileDown aria-hidden="true" />
        Exportar transações
      </Button>
      {message && (
        <p
          className="max-w-xs text-right text-xs text-gray-500 dark:text-gray-400"
          aria-live="polite"
        >
          {message}
        </p>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar transações</DialogTitle>
            <DialogDescription className="pt-2 leading-relaxed">
              O arquivo terá todas as suas transações, não apenas as exibidas
              nesta página. O download começará quando a geração terminar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="direct-export-format"
            >
              Formato
            </label>
            <Select
              value={format}
              onValueChange={(value) =>
                setFormat(normalizeTransactionExportFormat(value))
              }
            >
              <SelectTrigger
                id="direct-export-format"
                aria-label="Formato da exportação"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRANSACTION_EXPORT_FORMATS).map(
                  ([value, details]) => (
                    <SelectItem key={value} value={value}>
                      {details.option}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" asChild>
              <a
                href={`/api/exports/transactions/direct?format=${format}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setOpen(false);
                  setMessage("Gerando arquivo. Aguarde o início do download.");
                }}
              >
                Confirmar exportação
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
