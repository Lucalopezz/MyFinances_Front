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

export interface SemesterPeriod {
  start: string;
  end: string;
}

export interface SemesterSummary {
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
  economyRate: number;
  highestSpendingCategory: FinancialSummary["highestSpendingCategory"];
  period: SemesterPeriod;
}

export interface CategorySpending {
  category: string;
  total: number;
  percentage: number;
}

export interface ComparativeBlock<T> {
  data: T | null;
  error: string | null;
}

export interface SemesterComparisonData {
  currentSummary: ComparativeBlock<SemesterSummary>;
  previousSummary: ComparativeBlock<SemesterSummary>;
  monthlyComparison: ComparativeBlock<MonthlyComparisonResponse>;
  categorySpending: ComparativeBlock<CategorySpending[]>;
  balancePercentageChange: number | null;
  currentPeriod: SemesterPeriod;
  previousPeriod: SemesterPeriod;
}
