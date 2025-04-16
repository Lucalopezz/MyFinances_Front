import { z } from "zod";

export interface WishListInterface {
  id: string;
  name: string;
  desiredValue: number;
  targetDate: Date;
  savedAmount: number;
}
export type NewWish = Omit<WishListInterface, "id" | "savedAmount">;

export const WishSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  desiredValue: z.number().nonnegative("O valor desejado deve ser positivo."),
  targetDate: z.coerce.date(),
});

export type WishSchemaType = z.infer<typeof WishSchema>;
