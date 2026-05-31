import {
  Briefcase,
  Car,
  CircleDollarSign,
  CircleHelp,
  CreditCard,
  Dog,
  Film,
  Gift,
  GraduationCap,
  HandCoins,
  Heart,
  Home,
  Landmark,
  Plane,
  Receipt,
  Scissors,
  Shield,
  ShoppingBag,
  TrendingUp,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const TRANSACTION_TYPES = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export const INCOME_CATEGORIES = [
  "SALARY",
  "FREELANCE",
  "INVESTMENTS",
  "GIFTS_RECEIVED",
  "REFUNDS",
  "OTHER_INCOME",
] as const;

export const EXPENSE_CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "ENTERTAINMENT",
  "UTILITIES",
  "HEALTH",
  "EDUCATION",
  "SHOPPING",
  "SUBSCRIPTIONS",
  "HOUSING",
  "TRAVEL",
  "PETS",
  "TAXES",
  "INSURANCE",
  "PERSONAL_CARE",
  "DEBT_PAYMENT",
  "OTHER",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type TransactionCategory = IncomeCategory | ExpenseCategory;

export const TRANSACTION_CATEGORIES = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
] as const;

export const CATEGORY_BY_TYPE = {
  [TRANSACTION_TYPES.INCOME]: INCOME_CATEGORIES,
  [TRANSACTION_TYPES.EXPENSE]: EXPENSE_CATEGORIES,
} as const;

export const CATEGORY_LABELS = {
  FOOD: "Alimentação",
  TRANSPORT: "Transporte",
  ENTERTAINMENT: "Entretenimento",
  UTILITIES: "Contas",
  SALARY: "Salário",
  HEALTH: "Saúde",
  EDUCATION: "Educação",
  SHOPPING: "Compras",
  SUBSCRIPTIONS: "Assinaturas",
  HOUSING: "Moradia",
  TRAVEL: "Viagens",
  PETS: "Pets",
  TAXES: "Impostos",
  INSURANCE: "Seguros",
  PERSONAL_CARE: "Cuidados Pessoais",
  DEBT_PAYMENT: "Dívidas",
  FREELANCE: "Freelance",
  INVESTMENTS: "Investimentos",
  GIFTS_RECEIVED: "Presentes",
  REFUNDS: "Reembolsos",
  OTHER: "Outros",
  OTHER_INCOME: "Outros",
} as const satisfies Record<TransactionCategory, string>;

export const CATEGORY_ICONS = {
  FOOD: Utensils,
  TRANSPORT: Car,
  ENTERTAINMENT: Film,
  UTILITIES: Receipt,
  SALARY: Briefcase,
  HEALTH: Heart,
  EDUCATION: GraduationCap,
  SHOPPING: ShoppingBag,
  SUBSCRIPTIONS: CreditCard,
  HOUSING: Home,
  TRAVEL: Plane,
  PETS: Dog,
  TAXES: Landmark,
  INSURANCE: Shield,
  PERSONAL_CARE: Scissors,
  DEBT_PAYMENT: HandCoins,
  FREELANCE: Briefcase,
  INVESTMENTS: TrendingUp,
  GIFTS_RECEIVED: Gift,
  REFUNDS: CircleDollarSign,
  OTHER: CircleHelp,
  OTHER_INCOME: CircleDollarSign,
} as const satisfies Record<TransactionCategory, LucideIcon>;

export const CATEGORY_CONFIG = {
  FOOD: {
    label: CATEGORY_LABELS.FOOD,
    icon: CATEGORY_ICONS.FOOD,
  },
  TRANSPORT: {
    label: CATEGORY_LABELS.TRANSPORT,
    icon: CATEGORY_ICONS.TRANSPORT,
  },
  ENTERTAINMENT: {
    label: CATEGORY_LABELS.ENTERTAINMENT,
    icon: CATEGORY_ICONS.ENTERTAINMENT,
  },
  UTILITIES: {
    label: CATEGORY_LABELS.UTILITIES,
    icon: CATEGORY_ICONS.UTILITIES,
  },
  SALARY: {
    label: CATEGORY_LABELS.SALARY,
    icon: CATEGORY_ICONS.SALARY,
  },
  HEALTH: {
    label: CATEGORY_LABELS.HEALTH,
    icon: CATEGORY_ICONS.HEALTH,
  },
  EDUCATION: {
    label: CATEGORY_LABELS.EDUCATION,
    icon: CATEGORY_ICONS.EDUCATION,
  },
  SHOPPING: {
    label: CATEGORY_LABELS.SHOPPING,
    icon: CATEGORY_ICONS.SHOPPING,
  },
  SUBSCRIPTIONS: {
    label: CATEGORY_LABELS.SUBSCRIPTIONS,
    icon: CATEGORY_ICONS.SUBSCRIPTIONS,
  },
  HOUSING: {
    label: CATEGORY_LABELS.HOUSING,
    icon: CATEGORY_ICONS.HOUSING,
  },
  TRAVEL: {
    label: CATEGORY_LABELS.TRAVEL,
    icon: CATEGORY_ICONS.TRAVEL,
  },
  PETS: {
    label: CATEGORY_LABELS.PETS,
    icon: CATEGORY_ICONS.PETS,
  },
  TAXES: {
    label: CATEGORY_LABELS.TAXES,
    icon: CATEGORY_ICONS.TAXES,
  },
  INSURANCE: {
    label: CATEGORY_LABELS.INSURANCE,
    icon: CATEGORY_ICONS.INSURANCE,
  },
  PERSONAL_CARE: {
    label: CATEGORY_LABELS.PERSONAL_CARE,
    icon: CATEGORY_ICONS.PERSONAL_CARE,
  },
  DEBT_PAYMENT: {
    label: CATEGORY_LABELS.DEBT_PAYMENT,
    icon: CATEGORY_ICONS.DEBT_PAYMENT,
  },
  OTHER: {
    label: CATEGORY_LABELS.OTHER,
    icon: CATEGORY_ICONS.OTHER,
  },
  FREELANCE: {
    label: CATEGORY_LABELS.FREELANCE,
    icon: CATEGORY_ICONS.FREELANCE,
  },
  INVESTMENTS: {
    label: CATEGORY_LABELS.INVESTMENTS,
    icon: CATEGORY_ICONS.INVESTMENTS,
  },
  GIFTS_RECEIVED: {
    label: CATEGORY_LABELS.GIFTS_RECEIVED,
    icon: CATEGORY_ICONS.GIFTS_RECEIVED,
  },
  REFUNDS: {
    label: CATEGORY_LABELS.REFUNDS,
    icon: CATEGORY_ICONS.REFUNDS,
  },
  OTHER_INCOME: {
    label: CATEGORY_LABELS.OTHER_INCOME,
    icon: CATEGORY_ICONS.OTHER_INCOME,
  },
} as const satisfies Record<
  TransactionCategory,
  { label: string; icon: LucideIcon }
>;
