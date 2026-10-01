export type CardPurchaseInput = {
  description: string;
  amount: number;
  date: string;
  category: string;
  installments: number;
};
export type CardInput = {
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  annualFee: number;
};
export type CardInvoice = {
  cycle: string;
  dueDate: string;
  closingDate: string;
  total: number;
  annualFee: number;
  paid: boolean;
  paymentDate: string | null;
  status: "PAID" | "PENDING" | "OVERDUE";
  lines: {
    id: string;
    purchaseId: string;
    description: string;
    category: string;
    number: number;
    installments: number;
    amount: number;
  }[];
};
export type CreditCard = CardInput & {
  id: string;
  used: number;
  available: number;
  purchases: (CardPurchaseInput & { id: string })[];
  invoices: CardInvoice[];
};
