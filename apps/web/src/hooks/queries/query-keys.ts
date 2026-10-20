export const queryKeys = {
  categories: { all: () => ["categories"], rules: () => ["category-rules"] },
  budgets: {
    all: () => ["budgets"],
    month: (month: string) => ["budgets", month],
  },
  dashboard: {
    summary: (month?: string) => ["dashboard", "summary", month ?? "current"],
    monthlyComparison: (month?: string) => [
      "dashboard",
      "monthly-comparison",
      month ?? "current",
    ],
    sixMonthComparison: () => ["dashboard", "six-month-comparison"],
  },
  fixedExpenses: {
    all: () => ["fixed-expenses"],
    detail: (id: string) => ["fixed-expenses", id],
  },
  notifications: {
    all: () => ["notifications"],
  },
  transactions: {
    all: () => ["transactions"],
    balance: () => ["transactions", "balance"],
    page: (page: number) => ["transactions", "page", page],
    totals: (
      filters: import("@/models/transaction.model").TransactionSearchFilters,
    ) => ["transactions", "totals", filters],
    search: (
      filters: import("@/models/transaction.model").TransactionSearchFilters,
      cursor?: string,
    ) => ["transactions", "search", filters, cursor ?? ""],
    detail: (id: string) => ["transactions", id],
  },
  user: {
    current: () => ["user", "current"],
  },
  wishlist: {
    all: () => ["wishlist"],
    detail: (id: string) => ["wishlist", id],
  },
} as const;
