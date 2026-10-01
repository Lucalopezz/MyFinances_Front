import { getWishList, getWishSummary } from "@/actions/wishlist/wishlist";
import { WishListPage } from "@/components/wishlist/content";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Wishlist() {
  let wishListItems;
  let summary;
  try {
    [wishListItems, summary] = await Promise.all([getWishList(), getWishSummary()]);
  } catch {
    return <main className="p-6"><h1 className="text-2xl font-bold">Metas indisponíveis</h1><p className="mt-2">Não foi possível carregar os saldos. Tente novamente.</p><Link className="mt-3 inline-block underline" href="/wishlist">Recarregar</Link></main>;
  }

  return (
    <div>
      <WishListPage wishListItems={wishListItems} initialSummary={summary} />
    </div>
  );
}
