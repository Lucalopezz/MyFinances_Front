import { getCards } from "@/actions/cards/cards";
import { CardsContent } from "@/components/cards/cards-content";
export const dynamic = "force-dynamic";
export default async function CardsPage() {
  // Falhas da consulta seguem até error.tsx do grupo privado, que oferece
  // recuperação e não mostra a exceção técnica. A página só recebe dados reais.
  return <CardsContent initialCards={await getCards()} />;
}
