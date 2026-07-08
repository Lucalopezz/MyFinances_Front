import { Suspense } from "react";
import { getWishList } from "@/services/wishlist.service";
import { WishListPage } from "@/components/wishlist/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
