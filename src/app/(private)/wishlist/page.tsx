import { getWishList, getWishSummary } from "@/actions/wishlist/wishlist";
import { WishListPage } from "@/components/wishlist/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Wishlist() {
  // Lista e saldos são carregados juntos. Se uma leitura falhar, a fronteira
  // privada cuida da tentativa novamente, evitando apresentar saldos incompletos
  // ou um estado vazio que pareça uma resposta válida da API.
  const [wishListItems, summary] = await Promise.all([getWishList(), getWishSummary()]);

  return (
    <div>
      <WishListPage wishListItems={wishListItems} initialSummary={summary} />
    </div>
  );
}
