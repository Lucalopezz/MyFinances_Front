"use client";

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/queries/query-keys";
import { getCategories } from "@/actions/category/categories";
import {
  CATEGORY_BY_TYPE,
  CATEGORY_CONFIG,
  type TransactionType,
} from "@/constants/transaction-categories";
import type { Category } from "@/models/category.model";

const defaults: Category[] = Object.entries(CATEGORY_BY_TYPE).flatMap(
  ([type, codes]) =>
    codes.map((id) => ({
      id,
      name: CATEGORY_CONFIG[id].label,
      type: type as TransactionType,
      icon: "Tag" as const,
      color: "#2563eb",
      archived: false,
      isDefault: true,
    })),
);
const CategoryContext = createContext<Category[]>(defaults);
export function CategoryProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: Category[];
}) {
  const query = useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: getCategories,
    initialData,
    retry: false,
  });
  return (
    <CategoryContext.Provider value={query.data ?? defaults}>
      {query.isPending && (
        <p role="status" className="px-4 py-2 text-sm">
          Carregando categorias...
        </p>
      )}
      {query.isError && (
        <p role="alert" className="px-4 py-2 text-sm text-red-600">
          Não foi possível atualizar o catálogo de categorias.{" "}
          <button className="underline" onClick={() => void query.refetch()}>
            Tentar novamente
          </button>
        </p>
      )}
      {children}
    </CategoryContext.Provider>
  );
}
export function useCategories() {
  const categories = useContext(CategoryContext);
  return {
    categories,
    categoryLabel: (id: string) =>
      categories.find((item) => item.id === id)?.name ?? id,
    categoryOptions: (type: TransactionType, preservedId?: string) =>
      categories.filter(
        (item) =>
          item.type === type && (!item.archived || item.id === preservedId),
      ),
  };
}
