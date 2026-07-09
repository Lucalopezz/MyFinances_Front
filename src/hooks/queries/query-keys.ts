export const queryKeys = {
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
