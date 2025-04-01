export interface FixedExpense {
  id?: string;
  name: string;
  amount: number;
  dueDate: string;
  recurrence: string;
  isPaid?: boolean;
}