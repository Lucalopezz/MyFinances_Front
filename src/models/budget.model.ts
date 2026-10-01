export interface MonthlyBudget {
  id: string;
  userId: string;
  monthKey: string;
  category: string;
  limitAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBudgetSummary extends MonthlyBudget {
  spentAmount: number;
  remainingAmount: number;
}

export type BudgetInput = Pick<
  MonthlyBudget,
  "monthKey" | "category" | "limitAmount"
>;
