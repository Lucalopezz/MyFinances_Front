"use client";

import Link from "next/link";
import { Check, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/transaction/delete-button";

interface RowActionsProps {
  editHref?: string;
  deleteId?: string;
  deleteAction?: (id: string) => Promise<void>;
  onMarkAsPaid?: () => void;
  markAsPaidDisabled?: boolean;
  markAsPaidTitle?: string;
}

export function RowActions({
  editHref,
  deleteId,
  deleteAction,
  onMarkAsPaid,
  markAsPaidDisabled,
  markAsPaidTitle = "Marcar como pago",
}: RowActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {onMarkAsPaid ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-600"
          disabled={markAsPaidDisabled}
          title={markAsPaidTitle}
          onClick={onMarkAsPaid}
        >
          <Check className="h-4 w-4" />
        </Button>
      ) : null}

      {editHref ? (
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href={editHref}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
      ) : null}

      {deleteAction ? (
        <DeleteButton id={deleteId} deleteAction={deleteAction} />
      ) : null}
    </div>
  );
}
