"use client";

import { WishListInterface } from "@/interfaces/wishlist.interface";
import { WishList } from "./ListWishes";



interface WishListPageProps {
  wishListItems: WishListInterface[];
}

export function WishListPage({ wishListItems }: WishListPageProps) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Minha Lista de Desejos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gerencie os itens que você deseja adquirir
        </p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {wishListItems.length} {wishListItems.length === 1 ? 'item' : 'itens'} na sua lista
        </div>
        <a href="/wishlist/new">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Adicionar novo desejo
          </button>
        </a>
      </div>
      
      <WishList wishListItems={wishListItems} />
    </div>
  );
}