import { WishListInterface } from "@/interfaces/wishlist.interface";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

type WishListType = Omit<WishListInterface, 'id'>

export async function getWishList(): Promise<WishListInterface[]> {
  const session = await getServerSession(authOptions);

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/wishlist`, {
      headers: {
        Authorization: `Bearer ${session?.jwt}`,
        "Content-Type": "application/json",
      },
      next: { tags: ["wishlist"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - sessão expirada");
      }
      throw new Error("Falha ao buscar itens de desejo");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro:", error);
    return [];
  }
}
