import type { ExpenseCategory } from "@/constants/transaction-categories";

export interface MonthlyBudget {
  id: string;
  userId: string;
  monthKey: string;
  category: ExpenseCategory;
  limitAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBudgetSummary extends MonthlyBudget {
  spentAmount: number;
  remainingAmount: number;
}

export type BudgetInput = Pick<MonthlyBudget, "monthKey" | "category" | "limitAmount">;
