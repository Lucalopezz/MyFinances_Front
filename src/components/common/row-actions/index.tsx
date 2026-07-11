"use client";

import Link from "next/link";
import { Check, Pencil, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/transaction/delete-button";

interface RowActionsProps {
  editHref?: string;
  onEdit?: () => void;
  editDisabled?: boolean;
  deleteId?: string;
  deleteAction?: (id: string) => Promise<void>;
  onMarkAsPaid?: () => void;
  markAsPaidActive?: boolean;
  markAsPaidDisabled?: boolean;
  markAsPaidTitle?: string;
}

export function RowActions({
  editHref,
  onEdit,
  editDisabled,
  deleteId,
  deleteAction,
  onMarkAsPaid,
  markAsPaidActive,
  markAsPaidDisabled,
  markAsPaidTitle = "Marcar como pago",
}: RowActionsProps) {
  const PaymentIcon = markAsPaidActive ? RotateCcw : Check;

  return (
    <div className="flex items-center gap-2">
      {onMarkAsPaid ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={
            markAsPaidActive
              ? "h-8 w-8 text-yellow-600"
              : "h-8 w-8 text-green-600"
          }
          disabled={markAsPaidDisabled}
          title={markAsPaidTitle}
          onClick={onMarkAsPaid}
        >
          <PaymentIcon className="h-4 w-4" />
        </Button>
      ) : null}

      {editHref ? (
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href={editHref}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
      ) : null}

      {onEdit ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={editDisabled}
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ) : null}

      {deleteAction ? (
        <DeleteButton id={deleteId} deleteAction={deleteAction} />
      ) : null}
    </div>
  );
}
