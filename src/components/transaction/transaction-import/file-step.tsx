"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  importFormSchema,
  toImportOptions,
  IMPORT_MAX_BYTES,
  type ImportFormValues,
  type ImportOptions,
} from "@/schemas/transaction-import.schema";

export const selectClass =
  "mt-1 w-full min-w-0 rounded-md border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900";

// Only reads the first logical record to label mapping choices. Parsing and
// validation of transaction data always happen in the authenticated API.
function firstRecord(text: string, delimiter: string): string[] {
  const values: string[] = [];
  let cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && char === delimiter) {
      values.push(cell);
      cell = "";
    } else if (!quoted && (char === "\n" || char === "\r")) break;
    else cell += char;
    if (values.length >= 100) break;
  }
  return [...values, cell].slice(0, 100);
}

export function ImportFileStep({
  busy,
  onPreview,
}: {
  busy: boolean;
  onPreview: (file: File, options: ImportOptions) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [error, setError] = useState("");
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      format: "CSV",
      encoding: "utf-8",
      source: "",
      delimiter: ";",
      dateFormat: "DD/MM/YYYY",
      decimalSeparator: ",",
      header: true,
      mode: "signed",
      dateColumn: "0",
      descriptionColumn: "1",
      valueColumn: "2",
      incomeColumn: "2",
      expenseColumn: "3",
      categoryColumn: "",
      externalIdColumn: "",
      typeColumn: "",
    },
  });
  const [format, delimiter, encoding, header, mode] = watch([
    "format",
    "delimiter",
    "encoding",
    "header",
    "mode",
  ]);
  useEffect(() => {
    let active = true;
    setColumns([]);
    if (file && format === "CSV") {
      void file
        .slice(0, 65536)
        .arrayBuffer()
        .then((data) => {
          const cells = firstRecord(
            new TextDecoder(encoding, { fatal: true })
              .decode(data)
              .replace(/^\uFEFF/, ""),
            delimiter,
          );
          if (active) setColumns(cells);
        })
        .catch(() => {
          if (active)
            setError(
              "Não foi possível ler as colunas. Confira a codificação do arquivo.",
            );
        });
    }
    return () => {
      active = false;
    };
  }, [file, format, delimiter, encoding]);

  const columnSelect = (
    name: keyof ImportFormValues,
    label: string,
    optional = false,
  ) => (
    <label className="min-w-0 text-sm" key={name}>
      {label}
      <select className={selectClass} {...register(name)}>
        <option value="">
          {optional ? "Não usar" : "Selecione uma coluna"}
        </option>
        {columns.map((cell, index) => (
          <option key={index} value={index}>
            {index + 1} —{" "}
            {header ? cell.slice(0, 55) || "Sem título" : `Coluna ${index + 1}`}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        setError("");
        if (!file || !file.size || file.size > IMPORT_MAX_BYTES) {
          setError("Selecione um arquivo de até 2 MiB que não esteja vazio.");
          return;
        }
        let options: ImportOptions;
        try {
          options = toImportOptions(values);
        } catch {
          setError(
            "Mapeie os campos obrigatórios. Cada campo deve usar uma coluna diferente.",
          );
          return;
        }
        await onPreview(file, options);
      })}
      className="space-y-4"
    >
      <fieldset disabled={busy} className="min-w-0 space-y-4">
        <label className="block text-sm font-medium">
          Arquivo CSV ou OFX
          <Input
            className="mt-1"
            type="file"
            accept=".csv,.ofx,text/csv,application/x-ofx"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setFile(selected);
              setError("");
              if (selected)
                setValue(
                  "format",
                  selected.name.toLowerCase().endsWith(".ofx") ? "OFX" : "CSV",
                );
            }}
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Até 2 MiB e 1.000 registros. Valores em reais. A prévia não cria
          transações.
        </p>
        <label className="block text-sm">
          Origem do extrato
          <Input
            className="mt-1"
            placeholder="Ex.: Meu banco — conta principal"
            maxLength={120}
            {...register("source")}
            aria-invalid={!!errors.source}
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Use o mesmo nome para extratos da mesma conta. Isso ajuda a
            identificar duplicatas.
          </span>
          {errors.source && (
            <span role="alert" className="text-red-600">
              {errors.source.message}
            </span>
          )}
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Formato
            <select className={selectClass} {...register("format")}>
              <option value="CSV">CSV</option>
              <option value="OFX">OFX</option>
            </select>
          </label>
          <label className="text-sm">
            Codificação
            <select className={selectClass} {...register("encoding")}>
              <option value="utf-8">UTF-8</option>
              <option value="windows-1252">Windows-1252 (ANSI)</option>
            </select>
          </label>
        </div>
        {format === "CSV" ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-sm">
                Separador de colunas
                <select className={selectClass} {...register("delimiter")}>
                  <option value=";">Ponto e vírgula (;)</option>
                  <option value=",">Vírgula (,)</option>
                  <option value={"\t"}>Tabulação</option>
                </select>
              </label>
              <label className="text-sm">
                Formato da data
                <select className={selectClass} {...register("dateFormat")}>
                  <option value="DD/MM/YYYY">Dia/mês/ano</option>
                  <option value="YYYY-MM-DD">Ano-mês-dia</option>
                  <option value="MM/DD/YYYY">Mês/dia/ano</option>
                </select>
              </label>
              <label className="text-sm">
                Separador decimal
                <select
                  className={selectClass}
                  {...register("decimalSeparator")}
                >
                  <option value=",">Vírgula: 1.234,56</option>
                  <option value=".">Ponto: 1,234.56</option>
                </select>
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("header")} />A primeira linha
              contém os nomes das colunas
            </label>
            <label className="block text-sm">
              Como os valores aparecem?
              <select className={selectClass} {...register("mode")}>
                <option value="signed">
                  Uma coluna de valor (despesas negativas ou coluna de tipo)
                </option>
                <option value="split">
                  Colunas separadas de entrada e saída
                </option>
              </select>
            </label>
            <div className="rounded-lg border p-3">
              <h3 className="mb-3 text-sm font-semibold">Mapear colunas</h3>
              {!columns.length && (
                <p className="text-sm text-muted-foreground">
                  Selecione um arquivo para visualizar suas colunas.
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {columnSelect("dateColumn", "Data")}
                {columnSelect("descriptionColumn", "Descrição")}
                {mode === "signed" ? (
                  <>
                    {columnSelect("valueColumn", "Valor")}
                    {columnSelect(
                      "typeColumn",
                      "Tipo (INCOME/EXPENSE, opcional)",
                      true,
                    )}
                  </>
                ) : (
                  <>
                    {columnSelect("incomeColumn", "Entrada")}
                    {columnSelect("expenseColumn", "Saída")}
                  </>
                )}
                {columnSelect(
                  "categoryColumn",
                  "Categoria (código ou ID, opcional)",
                  true,
                )}
                {columnSelect(
                  "externalIdColumn",
                  "Identificador externo (opcional)",
                  true,
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Sem coluna de tipo, valores negativos são despesas e positivos
                são receitas. Entrada e saída devem ser positivas. Datas devem
                conter apenas o dia, sem horário.
              </p>
            </div>
          </>
        ) : (
          <p className="rounded-lg border p-3 text-sm text-muted-foreground">
            OFX bancário ou de cartão, XML/SGML, com uma conta por arquivo.
            Data, descrição, valor e identificador são lidos automaticamente.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={busy || !file}>
            {busy ? "Analisando arquivo…" : "Gerar prévia"}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
