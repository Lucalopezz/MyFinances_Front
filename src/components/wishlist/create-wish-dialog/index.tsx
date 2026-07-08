import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { NewWish, WishSchema } from "@/interfaces/wishlist.interface";

type WishDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (wish: NewWish) => void;
  loading: boolean;
};

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
      targetDate: new Date(),
    },
  });

  const handleFormSubmit = (data: NewWish) => {
    onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[500px]",
          "bg-[#2C3344] border-none",
          "text-white",
          "rounded-lg"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-white">
            Adicionar Novo Desejo
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="grid gap-4 py-4"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-white">
              Nome
            </Label>
            <div className="col-span-3">
              <Input
                id="name"
                {...register("name")}
                placeholder="PlayStation 5"
                className={cn(
                  "bg-[#364152] border-none text-white placeholder-gray-400",
                  errors.name && "border-red-500"
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="desiredValue" className="text-right text-white">
              Preço
            </Label>
            <div className="col-span-3">
              <Input
                id="desiredValue"
                type="number"
                step="0.01"
                {...register("desiredValue", {
                  setValueAs: (v) => parseFloat(v),
                })}
                placeholder="3999.90"
                className={cn(
                  "bg-[#364152] border-none text-white placeholder-gray-400",
                  errors.desiredValue && "border-red-500"
                )}
              />
              {errors.desiredValue && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.desiredValue.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetDate" className="text-right text-white">
              Data Alvo
            </Label>
            <div className="col-span-3">
              <Input
                id="targetDate"
                type="date"
                {...register("targetDate", {
                  setValueAs: (v) => new Date(v),
                })}
                className={cn(
                  "bg-[#364152] border-none text-white",
                  errors.targetDate && "border-red-500"
                )}
              />
              {errors.targetDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.targetDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Carregando" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
