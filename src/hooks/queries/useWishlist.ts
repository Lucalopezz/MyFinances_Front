"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { createWishAction } from "@/actions/wishlist/create-wish-action";
import { deleteWishAction } from "@/actions/wishlist/delete-wish-action";
import { getWishList } from "@/actions/wishlist/wishlist";
import type { NewWish, WishListInterface } from "@/models/wishlist.model";
import { queryKeys } from "@/hooks/queries/query-keys";

export function useWishlist(initialData?: WishListInterface[]) {
  return useQuery({
    queryKey: queryKeys.wishlist.all(),
    queryFn: getWishList,
    initialData,
  });
}

export function useCreateWish() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (wish: NewWish) => createWishAction(wish),
    onSuccess: () => {
      toast.success("Item criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all() });
    },
  });

  return {
    createWish: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useDeleteWish() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteWishAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all() });
    },
  });

  return {
    deleteWish: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
