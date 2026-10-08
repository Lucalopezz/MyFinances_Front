"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  archiveCategory,
  deleteCategoryRule,
  getCategoryRules,
  setCategoryRuleEnabled,
} from "@/actions/category/categories";
import { useCategories } from "@/providers/category-provider";
import type { Category, CategoryRule } from "@/models/category.model";
import { Button } from "@/components/ui/button";
import { CategoryEditor } from "./category-editor";
import { RuleEditor } from "./rule-editor";
import { errorMessage } from "./form-utils";
import { queryKeys } from "@/hooks/queries/query-keys";
import { CategoryIcon } from "@/components/category/category-icon";

export function CategoriesSettings() {
  const { categories, categoryLabel } = useCategories();
  const client = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<
    Category | null | undefined
  >();
  const [editingRule, setEditingRule] = useState<
    CategoryRule | null | undefined
  >();
  const rules = useQuery({
    queryKey: queryKeys.categories.rules(),
    queryFn: getCategoryRules,
    retry: false,
  });
  const refresh = async () => {
    await Promise.all(
      [
        queryKeys.categories.all(),
        queryKeys.categories.rules(),
        queryKeys.transactions.all(),
        queryKeys.budgets.all(),
        queryKeys.fixedExpenses.all(),
        ["dashboard"],
      ].map((queryKey) => client.invalidateQueries({ queryKey })),
    );
  };
  const mutation = useMutation({
    mutationFn: (action: () => Promise<unknown>) => action(),
    onSuccess: async () => {
      await refresh();
      toast.success("Alterações salvas.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const custom = categories.filter((item) => !item.isDefault);
  return (
    <div className="space-y-6">
      <section
        className="rounded-xl border bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
        aria-labelledby="categories-title"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="categories-title" className="text-lg font-semibold">
              Categorias personalizadas
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Organize receitas e despesas com nome, cor e ícone.
            </p>
          </div>
          <Button onClick={() => setEditingCategory(null)}>
            Nova categoria
          </Button>
        </div>
        {custom.length === 0 && (
          <p className="py-4 text-sm text-gray-500">
            Você ainda não criou categorias personalizadas. As categorias padrão
            continuam disponíveis.
          </p>
        )}
        <ul className="grid gap-3 md:grid-cols-2">
          {custom.map((category) => (
            <li
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 dark:border-gray-700"
            >
              <div className="flex min-w-0 items-center gap-2">
                <CategoryIcon icon={category.icon} color={category.color} />
                <div>
                  <p className="break-words font-medium">{category.name}</p>
                  <p className="text-xs text-gray-500">
                    {category.type === "INCOME" ? "Receita" : "Despesa"}
                    {category.archived ? " · Arquivada" : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCategory(category)}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={mutation.isPending}
                  onClick={() => {
                    if (
                      category.archived ||
                      window.confirm(
                        "Arquivar esta categoria? O histórico será preservado. Novos lançamentos e pagamentos de despesas fixas precisarão de uma categoria ativa.",
                      )
                    )
                      mutation.mutate(() =>
                        archiveCategory(category.id, !category.archived),
                      );
                  }}
                >
                  {category.archived ? "Restaurar" : "Arquivar"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer">Categorias padrão</summary>
          <p className="my-2 text-gray-500">
            As categorias padrão continuam disponíveis para seus lançamentos.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories
              .filter((item) => item.isDefault)
              .map((item) => (
                <li key={item.id}>
                  {item.name} · {item.type === "INCOME" ? "Receita" : "Despesa"}
                </li>
              ))}
          </ul>
        </details>
      </section>
      <section
        className="rounded-xl border bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
        aria-labelledby="rules-title"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="rules-title" className="text-lg font-semibold">
              Regras automáticas
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A menor prioridade numérica vence. Em empate, vale a ordem abaixo.
              Sua escolha manual prevalece.
            </p>
          </div>
          <Button onClick={() => setEditingRule(null)}>Nova regra</Button>
        </div>
        {rules.isPending && <p role="status">Carregando regras...</p>}
        {rules.isError && (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage(rules.error)}{" "}
            <button className="underline" onClick={() => void rules.refetch()}>
              Tentar novamente
            </button>
          </p>
        )}
        {rules.data?.length === 0 && (
          <p className="py-4 text-sm text-gray-500">
            Nenhuma regra cadastrada. Exemplo: descrição contém Uber →
            Transporte.
          </p>
        )}
        <ol className="space-y-3">
          {rules.data?.map((rule) => {
            const archived = categories.find(
              (item) => item.id === rule.category,
            )?.archived;
            return (
              <li
                key={rule.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 dark:border-gray-700"
              >
                <div className="min-w-0">
                  <p className="break-words font-medium">
                    Contém “{rule.contains}” → {categoryLabel(rule.category)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Prioridade {rule.priority} ·{" "}
                    {rule.type === "INCOME" ? "Receita" : "Despesa"} ·{" "}
                    {rule.enabled ? "Ativa" : "Desativada"}
                    {archived ? " · Ignorada: categoria arquivada" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRule(rule)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={mutation.isPending || (!rule.enabled && archived)}
                    onClick={() =>
                      mutation.mutate(() =>
                        setCategoryRuleEnabled(rule.id, !rule.enabled),
                      )
                    }
                  >
                    {rule.enabled ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={mutation.isPending}
                    onClick={() => {
                      if (window.confirm("Excluir esta regra?"))
                        mutation.mutate(() => deleteCategoryRule(rule.id));
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-xs text-gray-500">
          Regras sugerem categorias em novos lançamentos. O histórico não é
          alterado. Maiúsculas e acentos são ignorados.
        </p>
      </section>
      {editingCategory !== undefined && (
        <CategoryEditor
          category={editingCategory}
          close={() => setEditingCategory(undefined)}
          onSaved={refresh}
        />
      )}
      {editingRule !== undefined && (
        <RuleEditor
          rule={editingRule}
          close={() => setEditingRule(undefined)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
