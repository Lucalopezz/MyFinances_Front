import type { CategoryInput, RuleInput } from "@/schemas/category.schema";

export type Category = CategoryInput & {
  id: string;
  archived: boolean;
  isDefault: boolean;
};
export type CategoryRule = RuleInput & { id: string };
export type CategoryResolution = {
  category: string | null;
  ruleId: string | null;
  source: "manual" | "rule" | null;
};
