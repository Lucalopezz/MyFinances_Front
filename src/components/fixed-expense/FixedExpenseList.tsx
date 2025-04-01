"use client";

import { FixedExpense } from "@/app/fixed-expenses/types";
import { Pencil, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "../transaction/DeleteButton";
import { deleteAction, markAsPaidAction } from "@/app/fixed-expenses/_actions";


interface FixedExpenseListProps {
  fixedExpenses: FixedExpense[];
  editUrlPrefix?: string;
}

export function FixedExpenseList({
  fixedExpenses,
  editUrlPrefix = "/fixed-expenses/edit",
}: FixedExpenseListProps) {
  return (
    <>
      {/* Versão Desktop (tabela) */}
      <div className="hidden md:block border rounded-lg shadow-sm border-gray-300 dark:border-gray-700">
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Table>
            <TableBody>
              {fixedExpenses.map((expense) => (
                <DesktopFixedExpenseRow
                  key={expense.id || `${expense.name}-${expense.amount}`}
                  expense={expense}
                  editUrlPrefix={editUrlPrefix}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Versão Mobile (cards) */}
      <div className="md:hidden space-y-3">
        {fixedExpenses.map((expense) => (
          <MobileFixedExpenseCard
            key={expense.id || `${expense.name}-${expense.amount}`}
            expense={expense}
            editUrlPrefix={editUrlPrefix}
          />
        ))}
      </div>
    </>
  );
}

// Componente para linha da tabela (desktop)
function DesktopFixedExpenseRow({
  expense,
  editUrlPrefix,
}: {
  expense: FixedExpense;
  editUrlPrefix: string;
}) {
  const expenseId = expense.id || encodeURIComponent(`${expense.name}-${expense.amount}`);

  return (
    <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
      <TableCell className="py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
        {expense.name}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-red-600 dark:text-red-400 font-medium">
        R$ {expense.amount.toFixed(2)}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
        {new Date(expense.dueDate).toLocaleDateString()}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {expense.recurrence}
        </Badge>
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        {expense.isPaid ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Pago
          </Badge>
        ) : (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Pendente
          </Badge>
        )}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <div className="flex space-x-2 items-center">
          <form action={markAsPaidAction}>
            <input type="hidden" name="id" value={expense.id} />
            <input type="hidden" name="dueDate" value={expense.dueDate} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-600"
              disabled={expense.isPaid}
              title={expense.isPaid ? "Já pago" : "Marcar como pago"}
            >
              <Check className="h-4 w-4" />
            </Button>
          </form>
          <a href={`${editUrlPrefix}/${expenseId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          </a>
          <DeleteButton id={expense.id} deleteAction={deleteAction} />
        </div>
      </TableCell>
    </TableRow>
  );
}

// Componente para card mobile
function MobileFixedExpenseCard({
  expense,
  editUrlPrefix,
}: {
  expense: FixedExpense;
  editUrlPrefix: string;
}) {
  const expenseId = expense.id || encodeURIComponent(`${expense.name}-${expense.amount}`);

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {expense.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Vencimento: {new Date(expense.dueDate).toLocaleDateString()}
          </div>
        </div>
        <div className="text-lg font-semibold text-red-600 dark:text-red-400">
          R$ {expense.amount.toFixed(2)}
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {expense.recurrence}
          </Badge>
          {expense.isPaid ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Pago
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              Pendente
            </Badge>
          )}
        </div>

        <div className="flex space-x-2">
          <form action={markAsPaidAction}>
            <input type="hidden" name="id" value={expense.id} />
            <input type="hidden" name="dueDate" value={expense.dueDate} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-600"
              disabled={expense.isPaid}
              title={expense.isPaid ? "Já pago" : "Marcar como pago"}
            >
              <Check className="h-4 w-4" />
            </Button>
          </form>
          <a href={`${editUrlPrefix}/${expenseId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          </a>
          <DeleteButton id={expense.id} deleteAction={deleteAction} />
        </div>
      </div>
    </div>
  );
}
