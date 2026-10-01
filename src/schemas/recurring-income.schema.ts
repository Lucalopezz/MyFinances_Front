import { z } from "zod";
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida.")
  .refine((v) => {
    const d = new Date(`${v}T12:00:00Z`);
    return (
      !isNaN(d.getTime()) &&
      d.toISOString().slice(0, 10) === v &&
      v >= "2000-01-01" &&
      v <= "2100-12-31"
    );
  }, "Informe uma data válida.");
const amount = z
  .number({ invalid_type_error: "Informe o valor." })
  .positive("O valor deve ser maior que zero.")
  .max(999999999)
  .multipleOf(0.01, "Use até duas casas decimais.");
export const recurringIncomeSchema = z.object({
  description: z.string().trim().min(1, "Informe uma descrição.").max(120),
  amount,
  category: z.string().min(1, "Escolha a categoria."),
  startDate: date,
  recurrence: z.enum(["MONTHLY", "YEARLY"]),
  paused: z.boolean(),
});
export const receiptSchema = z.object({ amount, date });
export type RecurringIncomeInput = z.infer<typeof recurringIncomeSchema>;
export type ReceiptInput = z.infer<typeof receiptSchema>;
