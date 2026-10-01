export type RecurringIncome = {
  id: string;
  revision: number;
  description: string;
  amount: number;
  category: string;
  startDate: string;
  recurrence: "MONTHLY" | "YEARLY";
  paused: boolean;
  effectiveFrom?: string;
};
export type CalendarEvent = {
  id: string;
  sourceId: string;
  dueDate: string;
  description: string;
  amount: number;
  category: string;
  type: "INCOME" | "EXPENSE";
  status: "PENDING" | "OVERDUE" | "SETTLED";
  actualDate?: string;
  actualAmount?: number;
  transactionId?: string;
};
export type DailyProjection = {
  start: string;
  end: string;
  baseBalance: number;
  overdueImpact: number;
  projectedBalance: number;
  firstNegativeDate: string | null;
  days: {
    date: string;
    balance: number;
    income: number;
    expense: number;
    realized: number;
  }[];
};
export type FinancialCalendar = {
  month: string;
  today: string;
  timezone: string;
  events: CalendarEvent[];
  overdue: CalendarEvent[];
  projection: DailyProjection;
};
