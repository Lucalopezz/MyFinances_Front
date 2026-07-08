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
};

export type TransactionFormValues = {
  type: TransactionType;
  value: number;
  date: Date;
  category: TransactionCategory;
  description: string;
};
