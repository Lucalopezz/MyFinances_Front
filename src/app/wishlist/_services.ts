import { NewWish, WishListInterface } from "@/interfaces/wishlist.interface";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";



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

export async function deleteWish(id: string | undefined): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    console.error("Não autorizado - sessão não encontrada");
    return false;
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/wishlist/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.jwt}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Item não encontrado");
      }
      throw new Error(`Falha ao deletar item: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar item:", error);
    return false;
  }
}

export async function getWish(id: string): Promise<WishListInterface | null> {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    console.error("Não autorizado - sessão não encontrada");
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/wishlist/${id}`,
      {
        headers: {
          Authorization: `Bearer ${session.jwt}`,
          "Content-Type": "application/json",
        },
        next: { tags: ["fixed-expense"] },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Despesa fixa não encontrada");
      }
      throw new Error(`Falha ao buscar despesa fixa: ${response.statusText}`);
    }

    const data: WishListInterface = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar despesa fixa:", error);
    return null;
  }
}

export async function updateWish(
  id: string,
  wishData: {
    name: string;
    desiredValue: number;
    targetDate: string;
    savedAmount: number;
  }
): Promise<WishListInterface | null> {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    console.error("Não autorizado - sessão não encontrada");
    return null;
  }

  try {
    const formattedWishData = {
      name: wishData.name,
      desiredValue: wishData.desiredValue,
      targetDate: new Date(wishData.targetDate), 
      savedAmount: wishData.savedAmount,
    };

    const response = await fetch(
      `${process.env.BACKEND_URL}/wishlist/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedWishData),
        next: { tags: ["wishlist"] },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Item de desejo não encontrado");
      }
      throw new Error(`Falha ao atualizar item de desejo: ${response.statusText}`);
    }

    const data: WishListInterface = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar item de desejo:", error);
    return null;
  }
}

export async function createWish(
  data: NewWish
): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    console.error("Não autorizado - sessão não encontrada");
    return false;
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/wishlist`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      }
      throw new Error(`Falha ao criar despesa fixa: ${response.statusText}`);
    }

   
    return true;
  } catch (error) {
    console.error("Erro ao criar despesa fixa:", error);
    return false;
  }
}
