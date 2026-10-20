"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/providers/category-provider";
import type { TransactionType } from "@/constants/transaction-categories";
import { CategoryIcon } from "./category-icon";

export function CategorySelect({
  type,
  value,
  onChange,
  preservedId,
  label = "Categoria",
}: {
  type: TransactionType;
  value: string;
  onChange: (value: string) => void;
  preservedId?: string;
  label?: string;
}) {
  const { categoryOptions } = useCategories();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue placeholder="Selecione a categoria" />
      </SelectTrigger>
      <SelectContent>
        {categoryOptions(type, preservedId).map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <span className="flex items-center gap-2">
              <CategoryIcon icon={category.icon} color={category.color} />
              {category.name}
              {category.archived ? " (arquivada)" : ""}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
