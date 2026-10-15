import { describe, expect, it } from "vitest";
import { confirmImportSchema, importOptionsSchema, toImportOptions, type ImportFormValues } from "@/schemas/transaction-import.schema";

const form: ImportFormValues = {
  format: "CSV", encoding: "utf-8", source: " Banco A ", delimiter: ";", dateFormat: "DD/MM/YYYY", decimalSeparator: ",", header: true, mode: "signed",
  dateColumn: "0", descriptionColumn: "1", valueColumn: "2", incomeColumn: "", expenseColumn: "", categoryColumn: "", externalIdColumn: "", typeColumn: "",
};

describe("Mapeamento e revisão de extratos", () => {
  it("usa coluna zero e mantém campos opcionais vazios sem colidir", () => {
    const options = toImportOptions(form);
    expect(options.source).toBe("Banco A");
    expect(options.csv?.columns).toMatchObject({ date: 0, description: 1, value: 2 });
    expect(options.csv?.columns.category).toBeUndefined();
  });
  it("converte colunas de entrada e saída sem transportar a coluna de valor", () => {
    expect(toImportOptions({ ...form, mode: "split", incomeColumn: "2", expenseColumn: "3" }).csv?.columns).toMatchObject({ income: 2, expense: 3 });
    expect(toImportOptions({ ...form, mode: "split", incomeColumn: "2", expenseColumn: "3" }).csv?.columns.value).toBeUndefined();
  });
  it("OFX dispensa mapeamento CSV", () => {
    expect(toImportOptions({ ...form, format: "OFX", dateColumn: "", valueColumn: "" })).toEqual({ format: "OFX", encoding: "utf-8", source: "Banco A" });
  });
  it.each(["", "-1", "100", "1.5", "texto"])("recusa coluna obrigatória inválida: %s", (dateColumn) => {
    expect(() => toImportOptions({ ...form, dateColumn })).toThrow();
  });
  it("recusa usar a mesma coluna para data e descrição", () => {
    expect(() => toImportOptions({ ...form, descriptionColumn: "0" })).toThrow("coluna diferente");
  });
  it("recusa CSV sem mapeamento e campos de payload desconhecidos", () => {
    expect(importOptionsSchema.safeParse({ format: "CSV", encoding: "utf-8", source: "Banco" }).success).toBe(false);
    expect(importOptionsSchema.safeParse({ ...toImportOptions(form), secret: true }).success).toBe(false);
  });
  const choice = { rowId: 1, selected: true, allowDuplicate: false, category: "FOOD" };
  it("exige decisão explícita e impede confirmação repetida da mesma linha", () => {
    expect(confirmImportSchema.safeParse({ rows: [choice] }).success).toBe(true);
    expect(confirmImportSchema.safeParse({ rows: [choice, choice] }).success).toBe(false);
    expect(confirmImportSchema.safeParse({ rows: [{ rowId: 1, selected: true }] }).success).toBe(false);
  });
  it("impede que o cliente reescreva os valores originais da prévia", () => {
    expect(confirmImportSchema.safeParse({ rows: [{ ...choice, value: 1 }] }).success).toBe(false);
    expect(confirmImportSchema.safeParse({ rows: [{ ...choice, rowId: 1001 }] }).success).toBe(false);
  });
});
