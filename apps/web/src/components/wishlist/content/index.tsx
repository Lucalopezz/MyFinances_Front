"use client";

import { useState } from "react";
import { CircleDollarSign, PiggyBank, Plus, Wallet } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  NewWish,
  WishListInterface,
  WishSummary,
} from "@/models/wishlist.model";
import {
  getWishSummary,
  settleWishMigration,
} from "@/actions/wishlist/wishlist";
import { queryKeys } from "@/hooks/queries/query-keys";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/summary-card";
import { cn } from "@/lib/utils";
import { WishList } from "../list-wishes";
import { WishDialog } from "../create-wish-dialog";
import { useCreateWish, useWishlist } from "@/hooks/queries/useWishlist";

interface WishListPageProps {
  wishListItems: WishListInterface[];
  initialSummary: WishSummary;
}

/** Mantém filtros locais e compartilha os saldos/reservas atualizados pelo cache da wishlist. */
export function WishListPage({
  wishListItems,
  initialSummary,
}: WishListPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");
  const [settling, setSettling] = useState(false);
  const queryClient = useQueryClient();
  const { data: currentWishListItems = [] } = useWishlist(wishListItems);
  const summaryQuery = useQuery({
    queryKey: ["wishlist", "summary"],
    queryFn: getWishSummary,
    initialData: initialSummary,
  });
  const summary = summaryQuery.data;
  const { createWish, isLoading } = useCreateWish();

  const handleAddWish = async (wish: NewWish) => {
    await createWish(wish);
  };

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all() });
    await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const pendingMigration = currentWishListItems.some(
    (item) => item.reservationMigrationState === "PENDING",
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Minha Lista de Desejos</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Acompanhe suas metas, reservas e compras concluídas
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
        >
          <Plus aria-hidden="true" /> Adicionar novo desejo
        </Button>
      </div>

      {/* Os mesmos cartões do restante do app distinguem os saldos do fundo do shell em ambos os temas. */}
      <section
        aria-label="Resumo das reservas"
        className="grid gap-4 lg:grid-cols-3"
      >
        {[
          {
            title: "Saldo registrado",
            value: summary.financialBalance,
            icon: Wallet,
          },
          {
            title: "Total reservado",
            value: summary.totalReserved,
            icon: PiggyBank,
          },
          {
            title: "Saldo livre",
            value: summary.freeBalance,
            icon: CircleDollarSign,
          },
        ].map(({ title, value, icon: Icon }) => (
          <SummaryCard
            key={title}
            title={title}
            className="min-w-0 gap-3 border-slate-200 bg-white dark:border-slate-700 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between gap-3">
              <p
                className={cn(
                  "min-w-0 break-words text-2xl font-semibold",
                  value < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-slate-900 dark:text-white",
                )}
              >
                {formatCurrency(value)}
              </p>
              <Icon
                aria-hidden="true"
                className="size-5 shrink-0 text-blue-600 dark:text-blue-400"
              />
            </div>
          </SummaryCard>
        ))}
      </section>
      {summaryQuery.isError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          Não foi possível atualizar os saldos.{" "}
          <Button variant="link" onClick={() => void summaryQuery.refetch()}>
            Tentar novamente
          </Button>
        </p>
      )}
      {summary.insufficient && (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
        >
          As despesas posteriores superaram o saldo livre. Suas reservas foram
          preservadas.
        </p>
      )}
      {pendingMigration && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/40">
          <p className="font-medium">Distribua suas reservas iniciais</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            O progresso antigo era uma estimativa anual repetida em cada item.
            Ele aparece como referência no histórico de cada meta, mas não virou
            dinheiro reservado. Use “Aportar” nas metas desejadas, respeitando o
            saldo livre.
          </p>
          <Button
            type="button"
            disabled={settling}
            className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
            onClick={async () => {
              setSettling(true);
              try {
                await settleWishMigration();
                await refresh();
                toast.success("Distribuição inicial concluída.");
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Não foi possível concluir a distribuição.",
                );
              } finally {
                setSettling(false);
              }
            }}
          >
            Concluir distribuição
          </Button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="group" aria-label="Filtrar metas">
          {(
            [
              ["ACTIVE", "Ativas"],
              ["COMPLETED", "Concluídas"],
            ] as const
          ).map(([status, label]) => (
            <Button
              key={status}
              type="button"
              variant={filter === status ? "default" : "outline"}
              aria-pressed={filter === status}
              className={
                filter === status
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border-slate-200 bg-white dark:border-slate-600 dark:bg-gray-800"
              }
              onClick={() => setFilter(status)}
            >
              {label}
            </Button>
          ))}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {
            currentWishListItems.filter((item) => item.status === "ACTIVE")
              .length
          }{" "}
          metas ativas
        </p>
      </div>
      <WishList
        wishListItems={currentWishListItems.filter(
          (item) => item.status === filter,
        )}
        onChanged={refresh}
      />

      <WishDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAddWish}
        loading={isLoading}
      />
    </div>
  );
}
