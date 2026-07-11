import type { FixedExpenseCategory } from "@/constants/transaction-categories";
import type { Transaction } from "@/models/transaction.model";

export interface FixedExpense {
  id?: string;
  name: string;
  amount: number;
  category: FixedExpenseCategory;
  dueDate: string;
  recurrence: string;
  isPaid?: boolean;
  paidAt?: string | null;
  paidTransactionId?: string | null;
  paidTransaction?: Transaction | null;
  lastNotificationDueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export type FixedExpensePaymentResult = {
  fixedExpense: FixedExpense;
  transaction?: Transaction | null;
};
