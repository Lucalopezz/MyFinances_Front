"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

import type {
  PaginatedTransactions,
  Transaction,
} from "@/models/transaction.model";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TransactionRowActions } from "../transaction-row-actions";
import {
  CATEGORY_LABELS,
  TRANSACTION_CATEGORIES,
} from "@/constants/transaction-categories";
import {
  useDeleteTransaction,
  useTransactions,
} from "@/hooks/queries/useTransactions";
import { MobileListCard } from "@/components/common/mobile-list-card";
import { ResponsiveList } from "@/components/common/responsive-list";
import { StatusBadge } from "@/components/common/status-badge";
import { formatShortDate, formatSignedCurrency } from "@/utils/formatters";
import { TransactionExport } from "../transaction-export";

interface TransactionListProps {
  transactions: PaginatedTransactions;
  page: number;
}

export function TransactionList({ transactions, page }: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data: currentTransactions = transactions } = useTransactions(
    page,
    transactions,
  );
  const currentPageTransactions = Array.isArray(currentTransactions?.data)
    ? currentTransactions.data
    : [];
  const { deleteTransaction } = useDeleteTransaction();
  const hasFilters = Boolean(
    search || type !== "ALL" || category !== "ALL" || startDate || endDate,
  );
  const filteredTransactions = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return currentPageTransactions.filter((transaction) => {
      const categoryLabel =
        CATEGORY_LABELS[transaction.category as keyof typeof CATEGORY_LABELS] ??
        transaction.category;
      const searchableContent = normalizeSearch(
        `${transaction.description} ${categoryLabel}`,
      );
      const transactionDate = transaction.date.slice(0, 10);

      return (
        (!normalizedSearch || searchableContent.includes(normalizedSearch)) &&
        (type === "ALL" || transaction.type === type) &&
        (category === "ALL" || transaction.category === category) &&
        (!startDate || transactionDate >= startDate) &&
        (!endDate || transactionDate <= endDate)
      );
    });
  }, [category, currentPageTransactions, endDate, search, startDate, type]);

  const clearFilters = () => {
    setSearch("");
    setType("ALL");
    setCategory("ALL");
    setStartDate("");
    setEndDate("");
  };

  return (
    <section className="space-y-4" aria-labelledby="transactions-list-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="transactions-list-title" className="text-xl font-semibold">
            Transações
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Os filtros consideram somente as até 50 transações carregadas nesta
            página.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A exportação em PDF inclui todas as suas transações, não apenas as
            exibidas nesta página.
          </p>
        </div>
        <TransactionExport />
      </div>

      <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 md:grid-cols-2 xl:grid-cols-5">
        <label className="md:col-span-2 xl:col-span-1">
          <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
            Buscar
          </span>
          <span className="relative block">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Descrição ou categoria"
              className="pl-9"
            />
          </span>
        </label>

        <div>
          <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
            Tipo
          </span>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full" aria-label="Filtrar por tipo">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os tipos</SelectItem>
              <SelectItem value="INCOME">Entradas</SelectItem>
              <SelectItem value="EXPENSE">Saídas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
            Categoria
          </span>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              className="w-full"
              aria-label="Filtrar por categoria"
            >
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as categorias</SelectItem>
              {TRANSACTION_CATEGORIES.map((transactionCategory) => (
                <SelectItem
                  key={transactionCategory}
                  value={transactionCategory}
                >
                  {CATEGORY_LABELS[transactionCategory]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label>
          <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
            Data inicial
          </span>
          <Input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => setStartDate(event.target.value)}
            aria-label="Data inicial"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
            Data final
          </span>
          <Input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => setEndDate(event.target.value)}
            aria-label="Data final"
          />
        </label>

        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={clearFilters}
            className="md:col-span-2 md:justify-self-start xl:col-span-5"
          >
            <X aria-hidden="true" />
            Limpar filtros
          </Button>
        )}
      </div>

      <p
        className="text-sm text-gray-500 dark:text-gray-400"
        aria-live="polite"
      >
        {filteredTransactions.length} de {currentPageTransactions.length}{" "}
        transações exibidas nesta página
      </p>

      <ResponsiveList
        items={filteredTransactions}
        getKey={getTransactionKey}
        emptyState={
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {hasFilters
              ? "Nenhuma transação desta página corresponde aos filtros."
              : "Nenhuma transação encontrada nesta página."}
          </div>
        }
        renderDesktopRow={(transaction) => (
          <DesktopTransactionRow
            transaction={transaction}
            handleDelete={deleteTransaction}
          />
        )}
        renderMobileCard={(transaction) => (
          <MobileTransactionCard
            transaction={transaction}
            handleDelete={deleteTransaction}
          />
        )}
      />

      <TransactionPagination meta={currentTransactions.meta} />
    </section>
  );
}

function TransactionPagination({
  meta,
}: {
  meta: PaginatedTransactions["meta"];
}) {
  if (meta.totalPages <= 1) return null;

  return (
    <nav
      className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-4 sm:flex-row dark:border-gray-700"
      aria-label="Paginação de transações"
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Página {meta.page} de {meta.totalPages} · {meta.total} transações
      </p>
      <div className="flex gap-2">
        {meta.page > 1 ? (
          <Button asChild variant="outline">
            <Link href={`/transactions?page=${meta.page - 1}`}>Anterior</Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Anterior
          </Button>
        )}
        {meta.page < meta.totalPages ? (
          <Button asChild variant="outline">
            <Link href={`/transactions?page=${meta.page + 1}`}>Próxima</Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Próxima
          </Button>
        )}
      </div>
    </nav>
  );
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function DesktopTransactionRow({
  transaction,
  handleDelete,
}: {
  transaction: Transaction;
  handleDelete: (id: string) => Promise<void>;
}) {
  const categoryLabel =
    CATEGORY_LABELS[transaction.category as keyof typeof CATEGORY_LABELS] ??
    transaction.category;

  return (
    <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
      <TableCell className="py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
        {formatShortDate(transaction.date)}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
        {transaction.description}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
        {categoryLabel}
      </TableCell>
      <TableCell
        className={`py-4 whitespace-nowrap font-medium ${
          transaction.type === "INCOME"
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {formatTransactionValue(transaction)}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <TransactionTypeBadge transaction={transaction} />
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap">
        <TransactionRowActions
          transaction={transaction}
          deleteAction={handleDelete}
        />
      </TableCell>
    </TableRow>
  );
}

function MobileTransactionCard({
  transaction,
  handleDelete,
}: {
  transaction: Transaction;
  handleDelete: (id: string) => Promise<void>;
}) {
  const categoryLabel =
    CATEGORY_LABELS[transaction.category as keyof typeof CATEGORY_LABELS] ??
    transaction.category;

  return (
    <MobileListCard
      title={transaction.description}
      meta={formatShortDate(transaction.date)}
      amount={formatTransactionValue(transaction)}
      amountClassName={
        transaction.type === "INCOME"
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      }
      footerLeft={
        <div className="flex items-center space-x-2">
          <Badge
            variant={transaction.type === "INCOME" ? "default" : "destructive"}
          >
            {categoryLabel}
          </Badge>
          {transaction.type === "INCOME" ? (
            <StatusBadge tone="green">Entrada</StatusBadge>
          ) : (
            <Badge variant="destructive">Saída</Badge>
          )}
        </div>
      }
      actions={
        <TransactionRowActions
          transaction={transaction}
          deleteAction={handleDelete}
        />
      }
    />
  );
}

function TransactionTypeBadge({ transaction }: { transaction: Transaction }) {
  return transaction.type === "INCOME" ? (
    <StatusBadge tone="green">Entrada</StatusBadge>
  ) : (
    <Badge variant="destructive">Saída</Badge>
  );
}

function formatTransactionValue(transaction: Transaction) {
  return formatSignedCurrency(
    transaction.value,
    transaction.type === "INCOME" ? "+" : "-",
  );
}

function getTransactionKey(transaction: Transaction) {
  return (
    transaction.id ||
    `${transaction.date}-${transaction.description}-${transaction.value}`
  );
}
