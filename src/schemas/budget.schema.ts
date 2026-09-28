import { z } from "zod";

import { categoryReferenceSchema } from "./category.schema";

export const budgetSchema = z.object({
  monthKey: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Selecione um mês válido."),
  category: categoryReferenceSchema,
  limitAmount: z.coerce
    .number()
    .finite()
    .positive("O limite deve ser maior que zero."),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;
