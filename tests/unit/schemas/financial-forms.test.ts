import { describe, expect, it } from "vitest";
import { LoginSchema } from "@/schemas/auth/login.schema";
import { RegisterSchema } from "@/schemas/auth/register.schema";
import { budgetSchema } from "@/schemas/budget.schema";
import { categorySchema, ruleSchema, categoryReferenceSchema } from "@/schemas/category.schema";
import { recurringIncomeSchema, receiptSchema } from "@/schemas/recurring-income.schema";
import { WishSchema } from "@/models/wishlist.model";

describe("Validação dos formulários financeiros", () => {
  it("aceita login válido e recusa e-mail e senha incompletos", () => {
    expect(LoginSchema.safeParse({ email: "user@example.test", password: "password123" }).success).toBe(true);
    expect(LoginSchema.safeParse({ email: "inválido", password: "123" }).success).toBe(false);
  });
  it("associa a divergência das senhas ao campo de confirmação", () => {
    const result = RegisterSchema.safeParse({ name: "Pessoa", email: "user@example.test", password: "password123", confirmPassword: "password456" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.confirmPassword).toEqual(["As senhas não coincidem"]);
  });
  it("aceita cadastro com confirmação correspondente", () => {
    expect(RegisterSchema.safeParse({ name: "Pessoa", email: "user@example.test", password: "password123", confirmPassword: "password123" }).success).toBe(true);
  });
  it("converte o limite digitado no orçamento para número", () => {
    expect(budgetSchema.parse({ monthKey: "2026-10", category: "FOOD", limitAmount: "100.25" }).limitAmount).toBe(100.25);
  });
  it.each([0, -1, "", "texto", Infinity, NaN])("recusa limite inválido: %s", (limitAmount) => {
    expect(budgetSchema.safeParse({ monthKey: "2026-10", category: "FOOD", limitAmount }).success).toBe(false);
  });
  it.each(["2026-00", "2026-13", "2026-1", "2026-10-01"])("recusa competência inválida: %s", (monthKey) => {
    expect(budgetSchema.safeParse({ monthKey, category: "FOOD", limitAmount: 100 }).success).toBe(false);
  });
  it.each(["FOOD", "OTHER_INCOME", "64f000000000000000000001"])("aceita referência de categoria: %s", (reference) => {
    expect(categoryReferenceSchema.safeParse(reference).success).toBe(true);
  });
  it.each(["", "food", "id-inválido", "<script>"])("recusa referência inválida: %s", (reference) => {
    expect(categoryReferenceSchema.safeParse(reference).success).toBe(false);
  });
  it("remove espaços do nome e valida ícone e cor de categoria", () => {
    const category = { name: " Café ", type: "EXPENSE", color: "#aAbBcC", icon: "Utensils" };
    expect(categorySchema.parse(category).name).toBe("Café");
    expect(categorySchema.safeParse({ ...category, name: "  " }).success).toBe(false);
    expect(categorySchema.safeParse({ ...category, color: "red" }).success).toBe(false);
    expect(categorySchema.safeParse({ ...category, icon: "Unknown" }).success).toBe(false);
  });
  it.each([-1, 0.5, 10000])("recusa prioridade de regra fora do contrato: %s", (priority) => {
    expect(ruleSchema.safeParse({ type: "EXPENSE", contains: "mercado", category: "FOOD", priority, enabled: true }).success).toBe(false);
  });
  const income = { description: " Salário ", amount: 100.25, category: "SALARY", startDate: "2024-02-29", recurrence: "MONTHLY", paused: false };
  it("aceita ocorrência bissexta e normaliza a descrição", () => {
    expect(recurringIncomeSchema.parse(income).description).toBe("Salário");
  });
  it.each(["2025-02-29", "2026-04-31", "1999-12-31", "2101-01-01", "15/10/2026"])("recusa data civil inválida: %s", (startDate) => {
    expect(recurringIncomeSchema.safeParse({ ...income, startDate }).success).toBe(false);
    expect(receiptSchema.safeParse({ amount: 100, date: startDate }).success).toBe(false);
  });
  it.each([0, -1, 10.001, Infinity, NaN])("recusa recebimento sem valor positivo em centavos: %s", (amount) => {
    expect(receiptSchema.safeParse({ amount, date: "2026-10-15" }).success).toBe(false);
  });
  it("permite meta sem prazo e recusa valor não positivo", () => {
    expect(WishSchema.parse({ name: "Livros", desiredValue: 100, targetDate: null }).targetDate).toBeNull();
    expect(WishSchema.safeParse({ name: "Livros", desiredValue: 0, targetDate: null }).success).toBe(false);
  });
});
