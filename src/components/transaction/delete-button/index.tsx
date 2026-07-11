"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import toast from "react-hot-toast";

interface DeleteButtonProps {
  id?: string; 
  deleteAction: (id: string) => Promise<void>;
}

export function DeleteButton({ id, deleteAction }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!id) return;
    
    if (!confirm("Tem certeza que deseja excluir esse item?")) return;

    startTransition(async () => {
      try {
        await toast.promise(
          deleteAction(id),
          {
            loading: "Excluindo item...",
            success: "Item excluído com sucesso!",
            error: (err) => err.message || "Falha ao excluir item"
          }
        );
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
    });
  };

  return (
    <Button
      onClick={handleDelete}
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-red-600 hover:text-red-800"
      disabled={!id || isPending} 
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}