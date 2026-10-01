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
import {
  categoryIcons,
  categorySchema,
  type CategoryInput,
} from "@/schemas/category.schema";
import { saveCategory } from "@/actions/category/categories";
import type { Category } from "@/models/category.model";
import { CategoryIcon } from "@/components/category/category-icon";
const iconLabels: Record<string, string> = {
  Briefcase: "Trabalho",
  Car: "Carro",
  CircleDollarSign: "Dinheiro",
  CircleHelp: "Outros",
  CreditCard: "Cartão",
  Dog: "Pet",
  Film: "Cinema",
  Gift: "Presente",
  GraduationCap: "Educação",
  HandCoins: "Pagamento",
  Heart: "Saúde",
  Home: "Casa",
  Landmark: "Banco",
  Plane: "Viagem",
  Receipt: "Conta",
  Scissors: "Cuidados pessoais",
  Shield: "Seguro",
  ShoppingBag: "Compras",
  TrendingUp: "Investimento",
  Utensils: "Alimentação",
  Tag: "Etiqueta",
};

export function CategoryEditor({
  category,
  close,
  onSaved,
}: {
  category: Category | null;
  close: () => void;
  onSaved: () => Promise<void>;
}) {
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ?? {
      name: "",
      type: "EXPENSE",
      color: "#2563eb",
      icon: "Tag",
    },
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
          <DialogTitle>
            {category ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
          <DialogDescription>
            O tipo fica fixo após a criação para preservar o histórico.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (data) => {
            try {
              await saveCategory(data, category?.id);
              await onSaved();
              toast.success("Categoria salva.");
              close();
            } catch (error) {
              form.setError("root", { message: errorMessage(error) });
            }
          })}
        >
          <label className="block text-sm">
            Nome
            <Input autoFocus maxLength={60} {...form.register("name")} />
          </label>
          <label className="block text-sm">
            Tipo
            <select
              className={selectClass}
              disabled={Boolean(category)}
              {...form.register("type")}
            >
              <option value="EXPENSE">Despesa</option>
              <option value="INCOME">Receita</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              Cor
              <Input type="color" {...form.register("color")} />
            </label>
            <label className="text-sm">
              Ícone
              <select className={selectClass} {...form.register("icon")}>
                {categoryIcons.map((icon) => (
                  <option key={icon} value={icon}>
                    {iconLabels[icon]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CategoryIcon
              icon={form.watch("icon")}
              color={form.watch("color")}
            />
            {form.watch("name") || "Prévia da categoria"}
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
              {form.formState.isSubmitting ? "Salvando..." : "Salvar categoria"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
