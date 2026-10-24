// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WishListPage } from "@/components/wishlist/content";
import type { WishListInterface } from "@/models/wishlist.model";

vi.mock("@/actions/wishlist/wishlist", () => ({
  getWishList: vi.fn(),
  getWishSummary: vi.fn(),
  settleWishMigration: vi.fn(),
  addWishMovement: vi.fn(),
  completeWish: vi.fn(),
}));
vi.mock("@/actions/wishlist/create-wish-action", () => ({
  createWishAction: vi.fn(),
}));
vi.mock("@/actions/wishlist/delete-wish-action", () => ({
  deleteWishAction: vi.fn(),
}));
vi.mock("@/providers/category-provider", () => ({
  useCategories: () => ({
    categories: [],
    isLoading: false,
    isError: false,
    categoryLabel: (id: string) => id,
  }),
}));
const item: WishListInterface = {
  id: "wish-1",
  name: "Viagem",
  desiredValue: 1000,
  targetDate: null,
  reservedAmount: 250,
  remainingAmount: 750,
  progressPercent: 25,
  monthlySuggestion: null,
  deadlineState: "NONE",
  legacySavedAmount: 0,
  reservationMigrationState: "SETTLED",
  status: "ACTIVE",
  completedAt: null,
  purchaseTransactionId: null,
  movements: [],
};
function renderWishlist(items: WishListInterface[] = []) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: 0 },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <WishListPage
        wishListItems={items}
        initialSummary={{
          financialBalance: 1500,
          totalReserved: 250,
          freeBalance: 1250,
          insufficient: false,
        }}
      />
    </QueryClientProvider>,
  );
}

describe("Apresentação da wishlist", () => {
  it("expõe o filtro selecionado e mantém metas concluídas separadas", async () => {
    renderWishlist([
      item,
      {
        ...item,
        id: "wish-2",
        name: "Livros",
        status: "COMPLETED",
        completedAt: "2026-10-20",
        purchaseTransactionId: "purchase-1",
      },
    ]);
    const filters = within(
      screen.getByRole("group", { name: "Filtrar metas" }),
    );
    expect(
      filters.getByRole("button", { name: "Ativas", pressed: true }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Viagem" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Livros" }),
    ).not.toBeInTheDocument();
    await userEvent.click(filters.getByRole("button", { name: "Concluídas" }));
    expect(
      filters.getByRole("button", { name: "Concluídas", pressed: true }),
    ).toBeInTheDocument();
    expect(
      filters.getByRole("button", { name: "Ativas", pressed: false }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Livros" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Viagem" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver transação" })).toHaveAttribute(
      "href",
      "/transactions/purchase-1",
    );
  });

  it("oferece orientação no estado vazio e abre o formulário pelo botão principal", async () => {
    renderWishlist();
    expect(screen.getByText("Nenhuma meta neste filtro.")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Adicionar novo desejo" }),
    );
    const dialog = within(
      screen.getByRole("dialog", { name: "Adicionar Novo Desejo" }),
    );
    expect(dialog.getByLabelText("Nome")).toBeVisible();
    expect(dialog.getByLabelText("Preço")).toBeVisible();
    await userEvent.click(dialog.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
