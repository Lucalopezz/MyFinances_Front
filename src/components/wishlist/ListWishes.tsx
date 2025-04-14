"use client";


import { Pencil, Calendar, DollarSign, Wallet } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteFixedExpenseAction } from "@/app/wishlist/_actions";
import { WishListInterface } from "@/interfaces/wishlist.interface";
import { DeleteButton } from "../transaction/DeleteButton";

interface WishListProps {
  wishListItems: WishListInterface[];
  editUrlPrefix?: string;
}

export function WishList({
  wishListItems,
  editUrlPrefix = "/wishlist/edit",
}: WishListProps) {
  return (
    <>
      {/* Versão Desktop (tabela) */}
      <div className="hidden md:block border rounded-lg shadow-sm border-gray-300 dark:border-gray-700">
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Table>
            <TableBody>
              {wishListItems.map((item) => (
                <DesktopWishListRow
                  key={item.id || `${item.name}-${item.desiredValue}`}
                  item={item}
                  editUrlPrefix={editUrlPrefix}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Versão Mobile (cards) */}
      <div className="md:hidden space-y-3">
        {wishListItems.map((item) => (
          <MobileWishListCard
            key={item.id || `${item.name}-${item.desiredValue}`}
            item={item}
            editUrlPrefix={editUrlPrefix}
          />
        ))}
      </div>
    </>
  );
}

// Componente para linha da tabela (desktop)
function DesktopWishListRow({
  item,
  editUrlPrefix,
}: {
  item: WishListInterface;
  editUrlPrefix: string;
}) {
  const itemId = item.id || encodeURIComponent(`${item.name}-${item.desiredValue}`);
  const targetDate = new Date(item.targetDate);
  const isTargetDatePassed = targetDate < new Date();
  const progressPercentage = item.desiredValue > 0 
    ? Math.min(Math.round((item.savedAmount / item.desiredValue) * 100), 100)
    : 0;

  return (
    <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
      <TableCell className="py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
        {item.name}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-blue-600 dark:text-blue-400 font-medium">
        R$ {item.desiredValue.toFixed(2)}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-green-600 dark:text-green-400">
        R$ {item.savedAmount.toFixed(2)}
        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
          <div 
            className="h-2 bg-green-500 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">{progressPercentage}%</span>
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
        {targetDate.toLocaleDateString()}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        {isTargetDatePassed ? (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Prazo expirado
          </Badge>
        ) : (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Dentro do prazo
          </Badge>
        )}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <div className="flex space-x-2 items-center">
          <a href={`${editUrlPrefix}/${itemId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          </a>
          <DeleteButton id={item.id} deleteAction={deleteFixedExpenseAction} />
        </div>
      </TableCell>
    </TableRow>
  );
}

// Componente para card mobile
function MobileWishListCard({
  item,
  editUrlPrefix,
}: {
  item: WishListInterface;
  editUrlPrefix: string;
}) {
  const itemId = item.id || encodeURIComponent(`${item.name}-${item.desiredValue}`);
  const targetDate = new Date(item.targetDate);
  const isTargetDatePassed = targetDate < new Date();
  const progressPercentage = item.desiredValue > 0 
    ? Math.min(Math.round((item.savedAmount / item.desiredValue) * 100), 100)
    : 0;

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {item.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Meta: {targetDate.toLocaleDateString()}
          </div>
        </div>
        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center">
          <DollarSign className="h-4 w-4 mr-1" />
          R$ {item.desiredValue.toFixed(2)}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center">
          <Wallet className="h-4 w-4 mr-1 text-green-600" />
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            Economizado: R$ {item.savedAmount.toFixed(2)}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
          <div 
            className="h-2 bg-green-500 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {progressPercentage}% do objetivo
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center">
        <div>
          {isTargetDatePassed ? (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
              Prazo expirado
            </Badge>
          ) : (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Dentro do prazo
            </Badge>
          )}
        </div>

        <div className="flex space-x-2">
          <a href={`${editUrlPrefix}/${itemId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          </a>
          <DeleteButton id={item.id} deleteAction={deleteFixedExpenseAction} />
        </div>
      </div>
    </div>
  );
}