import { getWishList } from "@/actions/wishlist/wishlist";
import { WishListPage } from "@/components/wishlist/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Wishlist() {
  const wishListItems = await getWishList();

  return (
    <div>
      <WishListPage wishListItems={wishListItems} />
    </div>
  );
}
