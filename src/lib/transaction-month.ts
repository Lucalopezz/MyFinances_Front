import type { TransactionSearchFilters } from "@/models/transaction.model";

export const MONTH_PATTERN = /^[1-9]\d{3}-(0[1-9]|1[0-2])$/;

export function transactionMonthRange(month: string) {
  const [year, number] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return { startDate: `${month}-01`, endDate: `${month}-${lastDay}` };
}

export function transactionMonthUrl(
  month: string,
  filters: TransactionSearchFilters = {},
) {
  const params = new URLSearchParams({ month });
  for (const key of ["type", "category", "search"] as const) {
    if (filters[key]) params.set(key, filters[key]);
  }
  return `/transactions?${params}`;
}
