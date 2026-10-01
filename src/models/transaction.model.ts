import type { TransactionType } from "@/constants/transaction-categories";

export type Transaction = {
  id?: string;
  value: number;
  date: string;
  category: string;
  description: string;
  type: TransactionType;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  paymentMethod?: "CASH" | "CREDIT";
  cardId?: string;
  installments?: number;
};

export type TransactionPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedTransactions = {
  data: Transaction[];
  meta: TransactionPaginationMeta;
};

export type TransactionSearchFilters = {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  category?: string;
  search?: string;
};

export type TransactionSearchPage = {
  data: Transaction[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type TransactionFormValues = {
  type: TransactionType;
  value: number;
  date: Date;
  category: string;
  description: string;
  paymentMethod: "CASH" | "CREDIT";
  cardId?: string;
  installments: number;
};
