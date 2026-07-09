import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DialogFormActionsProps {
  onCancel: () => void;
  submitLabel: string;
  isLoading?: boolean;
  loadingLabel?: string;
  className?: string;
  cancelClassName?: string;
  submitClassName?: string;
}

export function DialogFormActions({
  onCancel,
  submitLabel,
  isLoading = false,
  loadingLabel = "Carregando",
  className,
  cancelClassName,
  submitClassName,
}: DialogFormActionsProps) {
  return (
    <div className={cn("flex justify-end gap-3 pt-4", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className={cancelClassName}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={isLoading} className={submitClassName}>
        {isLoading ? loadingLabel : submitLabel}
      </Button>
    </div>
  );
}
