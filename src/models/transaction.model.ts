import type {
  TransactionCategory,
  TransactionType,
} from "@/constants/transaction-categories";

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

export type TransactionFormValues = {
  type: TransactionType;
  value: number;
  date: Date;
  category: TransactionCategory;
  description: string;
};
