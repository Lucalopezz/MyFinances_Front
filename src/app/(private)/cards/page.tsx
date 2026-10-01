import { getCards } from "@/actions/cards/cards";
import { CardsContent } from "@/components/cards/cards-content";
export const dynamic = "force-dynamic";
export default async function CardsPage() {
  try {
    return <CardsContent initialCards={await getCards()} />;
  } catch (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Cartões</h1>
        <p role="alert" className="mt-4 text-red-600">
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar os cartões."}
        </p>
      </main>
    );
  }
}
