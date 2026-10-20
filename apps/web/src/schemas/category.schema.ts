import { z } from "zod";

export const categoryReferenceSchema = z
  .string()
  .regex(/^(?:[A-Z][A-Z_]{0,39}|[a-f\d]{24})$/, "Selecione uma categoria.");
export const categoryIcons = [
  "Briefcase",
  "Car",
  "CircleDollarSign",
  "CircleHelp",
  "CreditCard",
  "Dog",
  "Film",
  "Gift",
  "GraduationCap",
  "HandCoins",
  "Heart",
  "Home",
  "Landmark",
  "Plane",
  "Receipt",
  "Scissors",
  "Shield",
  "ShoppingBag",
  "TrendingUp",
  "Utensils",
  "Tag",
] as const;
export const categorySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome.").max(60),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string().regex(/^#[a-f\d]{6}$/i, "Informe uma cor hexadecimal."),
  icon: z.enum(categoryIcons),
});
export const ruleSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  contains: z.string().trim().min(1, "Informe o texto da descrição.").max(100),
  category: categoryReferenceSchema,
  priority: z.number().int().min(0).max(9999),
  enabled: z.boolean(),
});
export type CategoryInput = z.infer<typeof categorySchema>;
export type RuleInput = z.infer<typeof ruleSchema>;
