import { z } from "zod";

export interface WishListInterface {
  id: string;
  name: string;
  desiredValue: number;
  targetDate: string | null;
  reservedAmount: number;
  remainingAmount: number;
  progressPercent: number;
  monthlySuggestion: number | null;
  deadlineState: "NONE" | "ON_TRACK" | "OVERDUE" | "REACHED";
  legacySavedAmount: number;
  reservationMigrationState: "PENDING" | "SETTLED";
  status: "ACTIVE" | "COMPLETED";
  completedAt: string | null;
  purchaseTransactionId: string | null;
  movements: WishMovement[];
}
export interface WishMovement {
  id: string;
  kind: "DEPOSIT" | "WITHDRAWAL" | "CONSUMPTION" | "RELEASE";
  value: number;
  date: string;
  note: string | null;
}
export interface WishSummary {
  financialBalance: number;
  totalReserved: number;
  freeBalance: number;
  insufficient: boolean;
}
export type NewWish = { name: string; desiredValue: number; targetDate: Date | null };

export const WishSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  desiredValue: z.number().positive("O valor desejado deve ser positivo."),
  targetDate: z.date().nullable(),
});

export type WishSchemaType = z.infer<typeof WishSchema>;
