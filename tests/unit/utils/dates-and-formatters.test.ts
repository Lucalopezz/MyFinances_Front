import { describe, expect, it, vi } from "vitest";
import { parseDateOnly, toDateInputValue } from "@/utils/date";
import { formatCurrency, formatSignedCurrency, formatShortDate, formatMonthLabel, formatPercentage, formatDateRange, formatTimeAgo } from "@/utils/formatters";
import { currentDay, shiftMonth } from "@/components/calendar/calendar-utils";

describe("Datas civis e exibição financeira", () => {
  it("preserva o dia de uma data ISO sem conversão para o dia anterior", () => {
    const date = parseDateOnly("2026-10-15T00:00:00Z");
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 15]);
    expect(toDateInputValue(date)).toBe("2026-10-15");
    expect(toDateInputValue("2026-10-15T00:00:00Z")).toBe("2026-10-15");
    expect(formatShortDate("2026-10-15T00:00:00Z")).toBe("15/10/2026");
  });
  it("trata datas ausentes ou ilegíveis sem quebrar a tela", () => {
    expect(Number.isNaN(parseDateOnly("inválida").getTime())).toBe(true);
    expect(toDateInputValue(new Date(NaN))).toBe("");
    expect(toDateInputValue("inválida")).toBe("");
    expect(formatShortDate()).toBe("-");
    expect(formatShortDate("inválida")).toBe("-");
    expect(formatMonthLabel("inválido")).toBe("Mês atual");
    expect(formatDateRange()).toBe("Período mensal");
  });
  it("formata centavos, sinais e percentuais em português", () => {
    expect(formatCurrency(1234.5).replace(/\s/g, " ")).toBe("R$ 1.234,50");
    expect(formatSignedCurrency(10, "+").replace(/\s/g, " ")).toBe("+ R$ 10,00");
    expect(formatPercentage(12.34)).toBe("12,3%");
    expect(formatPercentage()).toBe("0%");
    expect(formatMonthLabel("2026-10")).toBe("Outubro de 2026");
    expect(formatDateRange("2026-10-01", "2026-10-31")).toBe("01/10/2026 a 31/10/2026");
  });
  it.each([["2026-01", -1, "2025-12"], ["2026-12", 1, "2027-01"], ["2024-02", 12, "2025-02"]] as const)("avança %s em %s mês(es)", (month, delta, expected) => {
    expect(shiftMonth(month, delta)).toBe(expected);
  });
  it("usa o dia de São Paulo na virada de mês em UTC", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T02:59:59Z"));
    expect(currentDay()).toBe("2026-10-31");
  });
  it.each([[0, "Agora"], [59, "Agora"], [60, "1m atrás"], [3600, "1h atrás"], [86400, "1d atrás"]])("exibe tempo decorrido de %s segundos", (seconds, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));
    expect(formatTimeAgo(new Date(Date.now() - seconds * 1000))).toBe(expected);
  });
});
