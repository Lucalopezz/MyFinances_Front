import { NewWish, WishListInterface } from "@/models/wishlist.model";
import { createJsonHeaders, getServerBackendUrl } from "@/lib/backend";
import { getServerToken } from "@/lib/serverAuth";
import { unstable_noStore as noStore } from "next/cache";

export async function createWish(data: NewWish): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    console.error("Não autorizado - sessão não encontrada");
    return false;
  }

  try {
    const response = await fetch(`${backendUrl}/wishlist`, {
      method: "POST",
      headers: createJsonHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      }
      throw new Error(`Falha ao criar item de desejo: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao criar item de desejo:", error);
    return false;
  }
}

export async function getWishList(): Promise<WishListInterface[]> {
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${backendUrl}/wishlist`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["wishlist"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - sessão expirada");
      }
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Erro:", error);
    return [];
  }
}

export async function deleteWish(id: string | undefined): Promise<boolean> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    console.error("Não autorizado - sessão não encontrada");
    return false;
  }

  try {
    const response = await fetch(`${backendUrl}/wishlist/${id}`, {
      method: "DELETE",
      headers: createJsonHeaders(token),
    });

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
  noStore();

  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${backendUrl}/wishlist/${id}`, {
      headers: createJsonHeaders(token),
      cache: "no-store",
      next: { tags: ["wishlist"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Item de desejo não encontrado");
      }
      return null;
    }

    const data: WishListInterface = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar item de desejo:", error);
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
  },
): Promise<WishListInterface | null> {
  const token = await getServerToken();
  const backendUrl = getServerBackendUrl();

  if (!token) {
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

    const response = await fetch(`${backendUrl}/wishlist/${id}`, {
      method: "PATCH",
      headers: createJsonHeaders(token),
      body: JSON.stringify(formattedWishData),
      next: { tags: ["wishlist"] },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado - token inválido ou expirado");
      } else if (response.status === 404) {
        console.error("Item de desejo não encontrado");
      }
      throw new Error(
        `Falha ao atualizar item de desejo: ${response.statusText}`,
      );
    }

    const data: WishListInterface = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar item de desejo:", error);
    return null;
  }
}
