"use client";

import { useState } from "react";
import { NewWish, WishListInterface, WishSummary } from "@/models/wishlist.model";
import { useQuery } from "@tanstack/react-query";
import { getWishSummary, settleWishMigration } from "@/actions/wishlist/wishlist";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/queries/query-keys";
import { formatCurrency } from "@/utils/formatters";
import toast from "react-hot-toast";
import { WishList } from "../list-wishes";
import { WishDialog } from "../create-wish-dialog";
import { useCreateWish, useWishlist } from "@/hooks/queries/useWishlist";

interface WishListPageProps {
  wishListItems: WishListInterface[];
  initialSummary: WishSummary;
}

export function WishListPage({ wishListItems, initialSummary }: WishListPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");
  const [settling, setSettling] = useState(false);
  const queryClient = useQueryClient();
  const { data: currentWishListItems = [] } = useWishlist(wishListItems);
  const summaryQuery = useQuery({ queryKey: ["wishlist", "summary"], queryFn: getWishSummary, initialData: initialSummary });
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

  const pendingMigration = currentWishListItems.some((item) => item.reservationMigrationState === "PENDING");

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Minha Lista de Desejos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Acompanhe suas metas, reservas e compras concluídas
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <p className="rounded-lg border p-3">Saldo registrado<br /><strong>{formatCurrency(summary.financialBalance)}</strong></p>
        <p className="rounded-lg border p-3">Total reservado<br /><strong>{formatCurrency(summary.totalReserved)}</strong></p>
        <p className="rounded-lg border p-3">Saldo livre<br /><strong>{formatCurrency(summary.freeBalance)}</strong></p>
      </div>
      {summaryQuery.isError && <p role="alert" className="mb-4 text-sm text-red-600">Não foi possível atualizar os saldos. <button className="underline" onClick={() => void summaryQuery.refetch()}>Tentar novamente</button></p>}
      {summary.insufficient && <p role="alert" className="mb-4 rounded border border-amber-500 p-3 text-amber-700 dark:text-amber-300">As despesas posteriores superaram o saldo livre. Suas reservas foram preservadas.</p>}
      {pendingMigration && <div className="mb-6 rounded-lg border border-blue-500 p-4">
        <p className="font-medium">Distribua suas reservas iniciais</p>
        <p className="text-sm text-muted-foreground">O progresso antigo era uma estimativa anual repetida em cada item. Ele aparece como referência no histórico de cada meta, mas não virou dinheiro reservado. Use “Aportar” nas metas desejadas, respeitando o saldo livre.</p>
        <button type="button" disabled={settling} className="mt-2 rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50" onClick={async () => {
          setSettling(true);
          try { await settleWishMigration(); await refresh(); toast.success("Distribuição inicial concluída."); }
          catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível concluir a distribuição."); }
          finally { setSettling(false); }
        }}>Concluir distribuição</button>
      </div>}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentWishListItems.filter((item) => item.status === "ACTIVE").length} metas ativas
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Adicionar novo desejo
        </button>
      </div>
      <div className="mb-4 flex gap-2" role="group" aria-label="Filtrar metas">
        <button type="button" className={`rounded px-3 py-2 ${filter === "ACTIVE" ? "bg-blue-600 text-white" : "border"}`} onClick={() => setFilter("ACTIVE")}>Ativas</button>
        <button type="button" className={`rounded px-3 py-2 ${filter === "COMPLETED" ? "bg-blue-600 text-white" : "border"}`} onClick={() => setFilter("COMPLETED")}>Concluídas</button>
      </div>
      <WishList wishListItems={currentWishListItems.filter((item) => item.status === filter)} onChanged={refresh} />

      <WishDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAddWish}
        loading={isLoading}
      />
    </div>
  );
}
