import { z } from "zod";
import { categoryReferenceSchema } from "./category.schema";

export const IMPORT_MAX_BYTES = 2 * 1024 * 1024;
const column = z.number().int().min(0).max(99);
export const importOptionsSchema = z
  .object({
    format: z.enum(["CSV", "OFX"]),
    encoding: z.enum(["utf-8", "windows-1252"]),
    source: z
      .string()
      .trim()
      .min(1, "Informe o banco e a conta de origem.")
      .max(120),
    csv: z
      .object({
        delimiter: z.enum([",", ";", "\t"]),
        dateFormat: z.enum(["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"]),
        decimalSeparator: z.enum([",", "."]),
        header: z.boolean(),
        columns: z
          .object({
            date: column,
            description: column,
            value: column.optional(),
            income: column.optional(),
            expense: column.optional(),
            category: column.optional(),
            externalId: column.optional(),
            type: column.optional(),
          })
          .strict()
          .refine(
            (c) =>
              c.value !== undefined
                ? c.income === undefined && c.expense === undefined
                : c.income !== undefined && c.expense !== undefined,
            "Mapeie valor ou entrada e saída.",
          )
          .refine(
            (c) =>
              new Set(Object.values(c).filter((v) => v !== undefined)).size ===
              Object.values(c).filter((v) => v !== undefined).length,
            "Use uma coluna diferente para cada campo.",
          ),
      })
      .optional(),
  })
  .strict()
  .refine((v) => v.format !== "CSV" || !!v.csv, "Informe o mapeamento CSV.");
export type ImportOptions = z.infer<typeof importOptionsSchema>;
export const confirmImportSchema = z
  .object({
    rows: z
      .array(
        z
          .object({
            rowId: z.number().int().min(1).max(1000),
            selected: z.boolean(),
            category: categoryReferenceSchema.optional(),
            allowDuplicate: z.boolean(),
          })
          .strict(),
      )
      .max(1000)
      .refine(
        (rows) => new Set(rows.map((r) => r.rowId)).size === rows.length,
        "Linha repetida.",
      ),
  })
  .strict();

export const importFormSchema = z.object({
  format: z.enum(["CSV", "OFX"]),
  encoding: z.enum(["utf-8", "windows-1252"]),
  source: z.string().trim().min(1, "Informe a origem do extrato.").max(120),
  delimiter: z.enum([",", ";", "\t"]),
  dateFormat: z.enum(["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"]),
  decimalSeparator: z.enum([",", "."]),
  header: z.boolean(),
  mode: z.enum(["signed", "split"]),
  dateColumn: z.string(),
  descriptionColumn: z.string(),
  valueColumn: z.string(),
  incomeColumn: z.string(),
  expenseColumn: z.string(),
  categoryColumn: z.string(),
  externalIdColumn: z.string(),
  typeColumn: z.string(),
});
export type ImportFormValues = z.infer<typeof importFormSchema>;
export function toImportOptions(form: ImportFormValues): ImportOptions {
  const required = (value: string) => (value === "" ? NaN : Number(value));
  const optional = (value: string) =>
    value === "" ? undefined : Number(value);
  return importOptionsSchema.parse({
    format: form.format,
    encoding: form.encoding,
    source: form.source,
    ...(form.format === "CSV"
      ? {
          csv: {
            delimiter: form.delimiter,
            dateFormat: form.dateFormat,
            decimalSeparator: form.decimalSeparator,
            header: form.header,
            columns: {
              date: required(form.dateColumn),
              description: required(form.descriptionColumn),
              ...(form.mode === "signed"
                ? {
                    value: required(form.valueColumn),
                    type: optional(form.typeColumn),
                  }
                : {
                    income: required(form.incomeColumn),
                    expense: required(form.expenseColumn),
                  }),
              category: optional(form.categoryColumn),
              externalId: optional(form.externalIdColumn),
            },
          },
        }
      : {}),
  });
}
