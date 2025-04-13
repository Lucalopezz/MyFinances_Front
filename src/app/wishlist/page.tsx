import { Suspense } from "react";
import { getWishList } from "./_services";
import { WishListPage } from "@/components/wishlist/Content";


export default async function Wishlist() {
  const wishListItems = await getWishList();

  return (
    <div>
      <Suspense fallback={<div>Carregando sua lista de desejos...</div>}>
        <WishListPage wishListItems={wishListItems} />
      </Suspense>
    </div>
  );
}