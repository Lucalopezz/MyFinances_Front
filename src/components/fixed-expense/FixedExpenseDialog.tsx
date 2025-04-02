"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createFixedExpense } from "@/app/fixed-expenses/_actions";
import { cn } from "@/lib/utils";

interface FixedExpenseDialogProps {
  setOpen: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  amount: z.number().min(0.01, { message: "Valor deve ser maior que zero" }),
  dueDate: z.string().min(1, { message: "Selecione uma data de vencimento" }),
  recurrence: z.string().min(1, { message: "Selecione a recorrência" }),
});

type FormData = z.infer<typeof formSchema>;

export function FixedExpenseDialog({ setOpen }: FixedExpenseDialogProps) {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: undefined,
      dueDate: new Date().toISOString().split("T")[0],
      recurrence: "MONTHLY",
    },
  });

  async function onSubmit(data: FormData) {
    try {
      await createFixedExpense(data);
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar despesa fixa:", error);
    }
  }

  return (
    <DialogContent
      className={cn(
        "sm:max-w-[425px]",
        "bg-[#2C3344] border-none",
        "text-white",
        "rounded-lg"
      )}
    >
      <DialogHeader>
        <DialogTitle>Nova despesa fixa</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Aluguel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="1500.00"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de vencimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recurrence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recorrência</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a recorrência" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Criar</Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
