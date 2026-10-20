"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormErrors, errorMessage, selectClass } from "./form-utils";
import { useState } from "react";
import { useCategories } from "@/providers/category-provider";
import { ruleSchema, type RuleInput } from "@/schemas/category.schema";
import {
  saveCategoryRule,
  testCategoryRule,
} from "@/actions/category/categories";
import type { CategoryRule } from "@/models/category.model";
import { CategorySelect } from "@/components/category/category-select";

export function RuleEditor({
  rule,
  close,
  onSaved,
}: {
  rule: CategoryRule | null;
  close: () => void;
  onSaved: () => Promise<void>;
}) {
  const [example, setExample] = useState("");
  const [testResult, setTestResult] = useState<{
    signature: string;
    message: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const { categoryLabel } = useCategories();
  const form = useForm<RuleInput>({
    resolver: zodResolver(ruleSchema),
    defaultValues: rule ?? {
      type: "EXPENSE",
      contains: "",
      category: "",
      priority: 0,
      enabled: true,
    },
  });
  const values = form.watch();
  const signature = JSON.stringify([values, example]);
  const test = form.handleSubmit(async (data) => {
    setTesting(true);
    try {
      const result = await testCategoryRule(data, example);
      setTestResult({
        signature,
        message:
          result.matches && result.category
            ? `Corresponde: ${categoryLabel(result.category)}. ${data.enabled ? "" : "A regra está desativada."}`
            : "A descrição não corresponde a esta regra.",
      });
    } catch (error) {
      setTestResult({ signature, message: errorMessage(error) });
    } finally {
      setTesting(false);
    }
  });
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !form.formState.isSubmitting) close();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? "Editar regra" : "Nova regra"}</DialogTitle>
          <DialogDescription>
            Escolha um trecho da descrição e a categoria de destino.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (data) => {
            try {
              await saveCategoryRule(data, rule?.id);
              await onSaved();
              toast.success("Regra salva.");
              close();
            } catch (error) {
              form.setError("root", { message: errorMessage(error) });
            }
          })}
        >
          <label className="block text-sm">
            Descrição contém
            <Input
              autoFocus
              maxLength={100}
              {...form.register("contains")}
              placeholder="Ex.: Uber"
            />
          </label>
          <label className="block text-sm">
            Tipo
            <select
              className={selectClass}
              {...form.register("type", {
                onChange: () => form.setValue("category", ""),
              })}
            >
              <option value="EXPENSE">Despesa</option>
              <option value="INCOME">Receita</option>
            </select>
          </label>
          <div className="space-y-1">
            <p className="text-sm">Categoria de destino</p>
            <CategorySelect
              type={values.type}
              value={values.category}
              onChange={(value) =>
                form.setValue("category", value, { shouldValidate: true })
              }
            />
          </div>
          <label className="block text-sm">
            Prioridade (menor número primeiro)
            <Input
              type="number"
              min={0}
              max={9999}
              {...form.register("priority", { valueAsNumber: true })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("enabled")} /> Regra ativa
          </label>
          <div className="space-y-2 rounded-lg border p-3 dark:border-gray-700">
            <label className="block text-sm">
              Descrição de exemplo
              <Input
                maxLength={2000}
                value={example}
                onChange={(event) => setExample(event.target.value)}
                placeholder="Ex.: Uber viagem ao trabalho"
              />
            </label>
            <Button
              type="button"
              variant="outline"
              disabled={testing || !example.trim()}
              onClick={() => void test()}
            >
              {testing ? "Testando..." : "Testar antes de salvar"}
            </Button>
            {testResult?.signature === signature && (
              <p role="status" className="text-sm">
                {testResult.message}
              </p>
            )}
          </div>
          <FormErrors
            errors={Object.values(form.formState.errors).map(
              (error) => error.message,
            )}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Salvar regra"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
