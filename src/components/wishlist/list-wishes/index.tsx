"use client";

import { Calendar, Wallet } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { WishListInterface } from "@/models/wishlist.model";
import { useDeleteWish } from "@/hooks/queries/useWishlist";
import { MobileListCard } from "@/components/common/mobile-list-card";
import { ResponsiveList } from "@/components/common/responsive-list";
import { RowActions } from "@/components/common/row-actions";
import { StatusBadge } from "@/components/common/status-badge";
import { formatCurrency, formatShortDate } from "@/utils/formatters";

interface WishListProps {
  wishListItems: WishListInterface[];
  editUrlPrefix?: string;
}

export function WishList({
  wishListItems,
  editUrlPrefix = "/wishlist/edit",
}: WishListProps) {
  const { deleteWish } = useDeleteWish();

  return (
    <ResponsiveList
      items={wishListItems}
      getKey={getWishKey}
      renderDesktopRow={(item) => (
        <DesktopWishListRow
          item={item}
          editUrlPrefix={editUrlPrefix}
          deleteAction={deleteWish}
        />
      )}
      renderMobileCard={(item) => (
        <MobileWishListCard
          item={item}
          editUrlPrefix={editUrlPrefix}
          deleteAction={deleteWish}
        />
      )}
    />
  );
}

function DesktopWishListRow({
  item,
  editUrlPrefix,
  deleteAction,
}: {
  item: WishListInterface;
  editUrlPrefix: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  const itemId = getWishEditId(item);
  const progressPercentage = getProgressPercentage(item);

  return (
    <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
      <TableCell className="py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
        {item.name}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-blue-600 dark:text-blue-400 font-medium">
        {formatCurrency(item.desiredValue)}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-green-600 dark:text-green-400">
        <WishProgress
          savedAmount={item.savedAmount}
          progressPercentage={progressPercentage}
          compact
        />
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
        {formatShortDate(item.targetDate)}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <WishDeadlineBadge item={item} />
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <RowActions
          editHref={`${editUrlPrefix}/${itemId}`}
          deleteId={item.id}
          deleteAction={deleteAction}
        />
      </TableCell>
    </TableRow>
  );
}

function MobileWishListCard({
  item,
  editUrlPrefix,
  deleteAction,
}: {
  item: WishListInterface;
  editUrlPrefix: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  const itemId = getWishEditId(item);
  const progressPercentage = getProgressPercentage(item);

  return (
    <MobileListCard
      title={item.name}
      meta={
        <span className="flex items-center">
          <Calendar className="mr-1 h-4 w-4" />
          Meta: {formatShortDate(item.targetDate)}
        </span>
      }
      amount={formatCurrency(item.desiredValue)}
      amountClassName="text-blue-600 dark:text-blue-400"
      footerLeft={<WishDeadlineBadge item={item} />}
      actions={
        <RowActions
          editHref={`${editUrlPrefix}/${itemId}`}
          deleteId={item.id}
          deleteAction={deleteAction}
        />
      }
    >
      <WishProgress
        savedAmount={item.savedAmount}
        progressPercentage={progressPercentage}
      />
    </MobileListCard>
  );
}

function WishProgress({
  savedAmount,
  progressPercentage,
  compact = false,
}: {
  savedAmount: number;
  progressPercentage: number;
  compact?: boolean;
}) {
  return (
    <>
      <div className="flex items-center">
        {!compact ? <Wallet className="mr-1 h-4 w-4 text-green-600" /> : null}
        <span className="text-sm font-medium text-green-600 dark:text-green-400">
          {compact
            ? formatCurrency(savedAmount)
            : `Economizado: ${formatCurrency(savedAmount)}`}
        </span>
      </div>
      <div
        className={
          compact
            ? "mt-1 h-2 w-24 rounded-full bg-gray-200"
            : "mt-1 h-2 w-full rounded-full bg-gray-200"
        }
      >
        <div
          className="h-2 rounded-full bg-green-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {compact
          ? `${progressPercentage}%`
          : `${progressPercentage}% do objetivo`}
      </div>
    </>
  );
}

function WishDeadlineBadge({ item }: { item: WishListInterface }) {
  return isWishTargetDatePassed(item) ? (
    <StatusBadge tone="red">Prazo expirado</StatusBadge>
  ) : (
    <StatusBadge tone="green">Dentro do prazo</StatusBadge>
  );
}

function getProgressPercentage(item: WishListInterface) {
  return item.desiredValue > 0
    ? Math.min(Math.round((item.savedAmount / item.desiredValue) * 100), 100)
    : 0;
}

function isWishTargetDatePassed(item: WishListInterface) {
  return new Date(item.targetDate) < new Date();
}

function getWishEditId(item: WishListInterface) {
  return item.id || encodeURIComponent(`${item.name}-${item.desiredValue}`);
}

function getWishKey(item: WishListInterface) {
  return item.id || `${item.name}-${item.desiredValue}`;
}
