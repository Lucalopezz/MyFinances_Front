export interface FinancialSummary {
  balance: number;
  totalIncomes: number;
  totalExpenses: number;
  economyRate?: number;
  highestSpendingCategory?: {
    category: string;
    total: number;
  } | null;
  period: {
    start: string;
    end: string;
  };
}

export interface MonthlyComparisonDto {
  month: string;
  totalExpenses: number;
  totalIncomes: number;
  balance?: number;
  economyRate?: number;
  percentageChange?: number;
}

export interface MonthlyComparisonResponse {
  months: MonthlyComparisonDto[];
  bestMonth?: {
    month: string;
    balance: number;
    economyRate?: number;
  } | null;
  worstMonth?: {
    month: string;
    balance: number;
    economyRate?: number;
  } | null;
  period: {
    start: string;
    end: string;
  };
}

export interface SixMonthComparisonItem extends MonthlyComparisonDto {
  label: string;
}
