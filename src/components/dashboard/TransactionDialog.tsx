"use client";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Transaction = {
  id?: string;
  value: number;
  date: string;
  category: string;
  description: string;
  type: "EXPENSE" | "INCOME";
};

const formattedDate = new Date().toISOString().split("T")[0];

const TransactionSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
  value: z.coerce.number().positive("Valor deve ser positivo"),
  date: z.date(),
  category: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().default(""),
});

type TransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (transaction: Transaction) => void;
  loading: boolean;
};

export const TransactionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: TransactionDialogProps) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof TransactionSchema>>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      type: "EXPENSE",
      date: new Date(),
      value: undefined,
      category: "",
      description: "",
    },
  });

  const handleFormSubmit = (data: z.infer<typeof TransactionSchema>) => {
    const transaction: Transaction = {
      ...data,
      value: data.value,
      date: format(data.date, "yyyy-MM-dd"),
    };

    onSubmit(transaction);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          Adicionar Transação
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "sm:max-w-[425px]",
          "bg-[#2C3344] border-none",
          "text-white",
          "rounded-lg"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-white">
            Adicionar Nova Transação
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="grid gap-4 py-4"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right text-white">
              Tipo
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="col-span-3 bg-[#364152] border-none text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2C3344] border-none text-white">
                    <SelectItem
                      value="EXPENSE"
                      className="hover:bg-[#364152] focus:bg-[#364152] text-white"
                    >
                      Gasto
                    </SelectItem>
                    <SelectItem
                      value="INCOME"
                      className="hover:bg-[#364152] focus:bg-[#364152] text-white"
                    >
                      Entrada
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right text-white">
              Valor
            </Label>
            <div className="col-span-3">
              <Input
                id="value"
                type="number"
                step="0.01"
                {...register("value", {
                  setValueAs: (v) => parseFloat(v),
                })}
                placeholder="150.00"
                className={cn(
                  "bg-[#364152] border-none text-white placeholder-gray-400",
                  errors.value && "border-red-500"
                )}
              />
              {errors.value && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.value.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right text-white">
              Data
            </Label>
            <div className="col-span-3">
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Input
                    id="date"
                    type="date"
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    className="bg-[#364152] border-none text-white"
                  />
                )}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right text-white">
              Categoria
            </Label>
            <div className="col-span-3">
              <Input
                id="category"
                {...register("category")}
                placeholder="Academia"
                className={cn(
                  "bg-[#364152] border-none text-white placeholder-gray-400",
                  errors.category && "border-red-500"
                )}
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right text-white">
              Descrição
            </Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Pagar a academia"
              className="col-span-3 bg-[#364152] border-none text-white placeholder-gray-400"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-[#364152] border-none text-white hover:bg-[#4A5567]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? "Carrgando" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
