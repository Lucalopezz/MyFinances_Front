import { z } from "zod";

import { EXPENSE_CATEGORIES } from "@/constants/transaction-categories";

export const budgetSchema = z.object({
  monthKey: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Selecione um mês válido."),
  category: z.enum(EXPENSE_CATEGORIES),
  limitAmount: z.coerce.number().finite().positive("O limite deve ser maior que zero."),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;
