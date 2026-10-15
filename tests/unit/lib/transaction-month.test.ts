import { describe, expect, it } from "vitest";
import { MONTH_PATTERN, transactionMonthRange, transactionMonthUrl } from "@/lib/transaction-month";

describe("Navegação mensal de transações", () => {
  it.each([
    ["2024-02", "2024-02-29"], ["2025-02", "2025-02-28"],
    ["2026-04", "2026-04-30"], ["2026-12", "2026-12-31"],
  ])("calcula o intervalo inclusivo de %s", (month, endDate) => {
    expect(transactionMonthRange(month)).toEqual({ startDate: `${month}-01`, endDate });
  });
  it.each(["2026-00", "2026-13", "26-01", "2026-1", "0000-01", "2026-01-01"])('recusa mês inválido: %s', (month) => {
    expect(MONTH_PATTERN.test(month)).toBe(false);
  });
  it("preserva texto e categoria sem transportar intervalo antigo ou cursor", () => {
    const url = new URL(transactionMonthUrl("2026-02", {
      type: "EXPENSE", category: "FOOD", search: "café & pão",
      startDate: "2026-01-01", endDate: "2026-01-31",
    }), "http://frontend.test");
    expect(Object.fromEntries(url.searchParams)).toEqual({ month: "2026-02", type: "EXPENSE", category: "FOOD", search: "café & pão" });
  });
});
