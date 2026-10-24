import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { NewWish, WishSchema } from "@/models/wishlist.model";
import { DialogFormActions } from "@/components/common/dialog-form-actions";
import { parseDateOnly } from "@/utils/date";

type WishDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (wish: NewWish) => void | Promise<void>;
  loading: boolean;
};

/** Formulário de meta com campos empilhados no celular e cores que acompanham o tema. */
export const WishDialog = ({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: WishDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewWish>({
    resolver: zodResolver(WishSchema),
    defaultValues: {
      name: "",
      desiredValue: 0,
      targetDate: null,
    },
  });

  const handleFormSubmit = async (data: NewWish) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[500px]",
          "max-h-[calc(100dvh-2rem)] overflow-y-auto border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-gray-800 dark:text-white",
          "rounded-lg",
        )}
      >
        <DialogHeader>
          <DialogTitle>Adicionar Novo Desejo</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Defina o valor da meta e, se quiser, uma data para alcançá-la.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="grid gap-4 py-4"
        >
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="name" className="sm:justify-end">
              Nome
            </Label>
            <div className="sm:col-span-3">
              <Input
                id="name"
                {...register("name")}
                placeholder="PlayStation 5"
                className={cn(
                  "border-slate-300 bg-white dark:border-slate-600 dark:bg-gray-700",
                  errors.name && "border-red-500",
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="desiredValue" className="sm:justify-end">
              Preço
            </Label>
            <div className="sm:col-span-3">
              <Input
                id="desiredValue"
                type="number"
                step="0.01"
                {...register("desiredValue", {
                  setValueAs: (v) => parseFloat(v),
                })}
                placeholder="3999.90"
                className={cn(
                  "border-slate-300 bg-white dark:border-slate-600 dark:bg-gray-700",
                  errors.desiredValue && "border-red-500",
                )}
              />
              {errors.desiredValue && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.desiredValue.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="targetDate" className="sm:justify-end">
              Data Alvo
            </Label>
            <div className="sm:col-span-3">
              <Input
                id="targetDate"
                type="date"
                {...register("targetDate", {
                  setValueAs: (v) => (v ? parseDateOnly(v) : null),
                })}
                className={cn(
                  "border-slate-300 bg-white dark:border-slate-600 dark:bg-gray-700",
                  errors.targetDate && "border-red-500",
                )}
              />
              {errors.targetDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.targetDate.message}
                </p>
              )}
            </div>
          </div>

          <DialogFormActions
            onCancel={() => onOpenChange(false)}
            isLoading={loading}
            submitLabel="Salvar"
            className="mt-4 flex-wrap gap-2"
            cancelClassName="border-slate-300 bg-white dark:border-slate-600 dark:bg-gray-700"
            submitClassName="bg-blue-600 hover:bg-blue-700 text-white"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
