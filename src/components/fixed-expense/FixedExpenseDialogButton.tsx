"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

import { Plus } from "lucide-react";
import { FixedExpenseDialog } from "./FixedExpenseDialog";

export function FixedExpenseDialogButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Nova despesa fixa
        </Button>
      </DialogTrigger>
      <FixedExpenseDialog setOpen={setOpen} />
    </Dialog>
  );
}