import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  getCards,
  getCard,
  createCard,
  createCardPurchase,
  payCardInvoice,
  refundCardPurchase,
  removeCard,
} from "@/actions/cards/cards";
import {
  getCategories,
  getCategoryRules,
  saveCategory,
  saveCategoryRule,
  archiveCategory,
  setCategoryRuleEnabled,
  deleteCategoryRule,
} from "@/actions/category/categories";
import {
  getFinancialCalendar,
  getRecurringIncomes,
  saveRecurringIncome,
  confirmIncome,
  pauseRecurringIncome,
} from "@/actions/calendar/calendar";
import {
  getWishList,
  getWishSummary,
  addWishMovement,
  completeWish,
  createWish,
} from "@/actions/wishlist/wishlist";
import {
  getBudgetSummary,
  createBudget,
  updateBudget,
  deleteBudget,
} from "@/actions/budget/budgets";
import { createTransactionAction } from "@/actions/transaction/create-transaction-action";
import { updateTransactionAction } from "@/actions/transaction/update-transaction-action";
import { deleteTransactionAction } from "@/actions/transaction/delete-transaction-action";
import {
  searchTransactions,
  getTransactionTotals,
  getTotalBalance,
} from "@/actions/transaction/search-transactions";
import { loginAction } from "@/actions/login/login-action";
import { getUser } from "@/actions/user/user";

const cookie = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => cookie }));
vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));

const transaction = {
  id: "transaction-id",
  type: "EXPENSE" as const,
  value: 10.25,
  category: "FOOD",
  description: "Café",
  date: "2026-10-15",
};
const category = {
  name: "Café",
  type: "EXPENSE" as const,
  color: "#aabbcc",
  icon: "Utensils" as const,
};
const rule = {
  type: "EXPENSE" as const,
  category: "FOOD",
  contains: "café",
  priority: 1,
  enabled: true,
};
const income = {
  description: "Salário",
  amount: 100,
  category: "SALARY",
  startDate: "2026-10-15",
  recurrence: "MONTHLY" as const,
  paused: false,
};
const budget = { monthKey: "2026-10", category: "FOOD", limitAmount: 100 };
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("BACKEND_URL", "http://backend.test");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock
    .mockReset()
    .mockImplementation(async () => Response.json({ id: "created-id" }));
  cookie.get.mockReturnValue({ value: "server-only-token" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("Transporte autenticado real das Server Actions", () => {
  const reads = [
    ["cartões", getCards, "/cards", []],
    ["cartão", () => getCard("card/id"), "/cards/card%2Fid", { id: "card/id" }],
    ["categorias", getCategories, "/categories", []],
    ["regras", getCategoryRules, "/category-rules", []],
    [
      "calendário",
      () => getFinancialCalendar("2026-10"),
      "/calendar?month=2026-10",
      { month: "2026-10" },
    ],
    ["receitas", getRecurringIncomes, "/calendar/incomes", []],
    ["metas", getWishList, "/wishlist", []],
    [
      "reservas",
      getWishSummary,
      "/wishlist/summary",
      { financialBalance: 100, freeBalance: 80, totalReserved: 20 },
    ],
    [
      "orçamentos",
      () => getBudgetSummary("2026-10"),
      "/budgets/summary?month=2026-10",
      [],
    ],
    [
      "saldo",
      getTotalBalance,
      "/transactions/balance",
      { totalIncome: 100, totalExpense: 20, balance: 80, count: 2 },
    ],
  ] as const;
  it.each(reads)(
    "consulta %s sem cache compartilhado e lê o token apenas no servidor",
    async (_, read, path, payload) => {
      fetchMock.mockResolvedValueOnce(Response.json(payload));
      expect(await read()).toEqual(payload);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`http://backend.test${path}`);
      expect(new Headers(init?.headers).get("Authorization")).toBe(
        "Bearer server-only-token",
      );
      expect(init?.cache).toBe("no-store");
    },
  );
  it.each(reads)("não consulta %s sem sessão", async (_, read) => {
    cookie.get.mockReturnValue(undefined);
    await expect(read()).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  const mutations = [
    [
      "cartão",
      () =>
        createCard({
          name: "Principal",
          limit: 100,
          annualFee: 0,
          closingDay: 5,
          dueDay: 12,
        }),
      "POST",
      "/cards",
      "cards",
    ],
    [
      "compra",
      () =>
        createCardPurchase("card/id", {
          amount: 100,
          description: "Livros",
          category: "FOOD",
          date: "2026-10-15",
          installments: 2,
        }),
      "POST",
      "/cards/card%2Fid/purchases",
      "transactions",
    ],
    [
      "fatura",
      () => payCardInvoice("card", "2026-10", "2026-10-15"),
      "POST",
      "/cards/card/invoices/2026-10/pay",
      "dashboard",
    ],
    [
      "estorno",
      () => refundCardPurchase("card", "purchase/id"),
      "POST",
      "/cards/card/purchases/purchase%2Fid/refund",
      "transactions",
    ],
    [
      "remoção de cartão",
      () => removeCard("card/id"),
      "DELETE",
      "/cards/card%2Fid",
      "cards",
    ],
    [
      "categoria",
      () => saveCategory(category),
      "POST",
      "/categories",
      "categories",
    ],
    [
      "regra",
      () => saveCategoryRule(rule),
      "POST",
      "/category-rules",
      "category-rules",
    ],
    [
      "arquivamento",
      () => archiveCategory("category/id", true),
      "PATCH",
      "/categories/category%2Fid",
      "categories",
    ],
    [
      "desativação de regra",
      () => setCategoryRuleEnabled("rule/id", false),
      "PATCH",
      "/category-rules/rule%2Fid",
      "category-rules",
    ],
    [
      "remoção de regra",
      () => deleteCategoryRule("rule/id"),
      "DELETE",
      "/category-rules/rule%2Fid",
      "category-rules",
    ],
    [
      "receita",
      () => saveRecurringIncome(income),
      "POST",
      "/calendar/incomes",
      "calendar",
    ],
    [
      "pausa",
      () => pauseRecurringIncome("income/id", true, 2),
      "PATCH",
      "/calendar/incomes/income%2Fid",
      "calendar",
    ],
    [
      "recebimento",
      () =>
        confirmIncome(
          { sourceId: "income/id", dueDate: "2026-10-15" },
          { amount: 100, date: "2026-10-15" },
        ),
      "POST",
      "/calendar/incomes/income%2Fid/occurrences/2026-10-15/confirm",
      "transactions",
    ],
    [
      "aporte",
      () =>
        addWishMovement("wish/id", {
          kind: "DEPOSIT",
          value: 10,
          date: "2026-10-15",
        }),
      "POST",
      "/wishlist/wish%2Fid/movements",
      "wishlist",
    ],
    [
      "conclusão",
      () =>
        completeWish("wish/id", {
          value: 10,
          date: "2026-10-15",
          category: "OTHER",
          description: "Compra",
        }),
      "POST",
      "/wishlist/wish%2Fid/complete",
      "transactions",
    ],
    ["orçamento", () => createBudget(budget), "POST", "/budgets", "budgets"],
    [
      "edição de orçamento",
      () => updateBudget("budget/id", budget),
      "PATCH",
      "/budgets/budget%2Fid",
      "budgets",
    ],
    [
      "remoção de orçamento",
      () => deleteBudget("budget/id"),
      "DELETE",
      "/budgets/budget%2Fid",
      "budgets",
    ],
  ] as const;
  it.each(mutations)(
    "grava %s uma vez e revalida as telas afetadas",
    async (_, mutate, method, path, tag) => {
      await mutate();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toBe(`http://backend.test${path}`);
      expect(fetchMock.mock.calls[0][1]?.method).toBe(method);
      expect(
        new Headers(fetchMock.mock.calls[0][1]?.headers).get("Authorization"),
      ).toBe("Bearer server-only-token");
      expect(revalidateTag).toHaveBeenCalledWith(tag);
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    },
  );
  it.each(mutations)(
    "falha de %s não repete a gravação nem revalida como sucesso",
    async (_, mutate) => {
      fetchMock.mockResolvedValue(
        Response.json({ message: "Prisma connection failed" }, { status: 503 }),
      );
      await expect(mutate()).rejects.toThrow(/Não foi possível/);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(revalidateTag).not.toHaveBeenCalled();
    },
  );
});

describe("Contratos de transações e autenticação", () => {
  it("login aceita objeto ou FormData e grava cookie seguro HTTP-only", async () => {
    vi.stubEnv("NODE_ENV", "production");
    fetchMock.mockImplementation(async () =>
      Response.json({ accessToken: "signed-token" }),
    );
    const form = new FormData();
    form.set("email", "user@example.test");
    form.set("password", "password123");
    for (const payload of [
      { email: "user@example.test", password: "password123" },
      form,
    ]) {
      await expect(loginAction(payload)).resolves.toEqual({ ok: true });
      expect(cookie.set).toHaveBeenLastCalledWith({
        name: "mf_token",
        value: "signed-token",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: true,
      });
    }
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      email: "user@example.test",
      password: "password123",
    });
  });
  it.each([401, 503])("login HTTP %s não grava cookie", async (status) => {
    fetchMock.mockResolvedValue(
      Response.json({ message: "Falha ao entrar" }, { status }),
    );
    await expect(
      loginAction({ email: "user@example.test", password: "password123" }),
    ).rejects.toThrow();
    expect(cookie.set).not.toHaveBeenCalled();
  });
  it("login sem accessToken não cria sessão", async () => {
    await expect(
      loginAction({ email: "user@example.test", password: "password123" }),
    ).rejects.toThrow();
    expect(cookie.set).not.toHaveBeenCalled();
  });
  it("edição de categoria não envia alteração do tipo imutável", async () => {
    await saveCategory(category, "category-id");
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      name: "Café",
      color: "#aabbcc",
      icon: "Utensils",
    });
  });
  it("direciona despesa no crédito ao domínio de cartões sem criar lançamento realizado", async () => {
    await createTransactionAction({
      ...transaction,
      paymentMethod: "CREDIT",
      cardId: "card",
      installments: 3,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://backend.test/cards/card/purchases",
    );
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      description: "Café",
      amount: 10.25,
      date: "2026-10-15",
      category: "FOOD",
      installments: 3,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("exige cartão antes de registrar compra no crédito", async () => {
    await expect(
      createTransactionAction({ ...transaction, paymentMethod: "CREDIT" }),
    ).rejects.toThrow("Selecione um cartão");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("criação, edição e exclusão atualizam projeção e orçamento", async () => {
    for (const mutate of [
      () => createTransactionAction(transaction),
      () => updateTransactionAction({ id: "id", transaction }),
      () => deleteTransactionAction("id"),
    ]) {
      vi.mocked(revalidateTag).mockClear();
      await mutate();
      for (const tag of ["transactions", "dashboard", "budgets", "calendar"])
        expect(revalidateTag).toHaveBeenCalledWith(tag);
    }
  });
  it("busca usa período e texto normalizados, mantendo o cursor opaco", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ data: [], hasMore: false, nextCursor: null }),
    );
    await searchTransactions(
      {
        startDate: "2026-10-01",
        endDate: "2026-10-31",
        search: " café & pão ",
        category: "FOOD",
        type: "EXPENSE",
      },
      "opaque-cursor",
    );
    expect(
      Object.fromEntries(
        new URL(String(fetchMock.mock.calls[0][0])).searchParams,
      ),
    ).toEqual({
      startDate: "2026-10-01",
      endDate: "2026-10-31",
      search: "café & pão",
      category: "FOOD",
      type: "EXPENSE",
      limit: "50",
      cursor: "opaque-cursor",
    });
  });
  it("totais usam filtros e saldo acumulado não recebe período", async () => {
    await getTransactionTotals({
      startDate: "2026-10-01",
      endDate: "2026-10-31",
    });
    await getTotalBalance();
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "summary?startDate=2026-10-01&endDate=2026-10-31",
    );
    expect(fetchMock.mock.calls[1][0]).toBe(
      "http://backend.test/transactions/balance",
    );
  });
  it("API legada sem busca retorna indisponibilidade explícita, resposta inválida falha", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    expect(await searchTransactions()).toBeNull();
    fetchMock.mockResolvedValueOnce(Response.json({ data: "inválido" }));
    await expect(searchTransactions()).rejects.toThrow();
  });
  it("perfil ausente difere de falha temporária do backend", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    expect(await getUser()).toBeNull();
    fetchMock.mockResolvedValue(
      Response.json({ message: "Erro interno" }, { status: 500 }),
    );
    await expect(getUser()).rejects.toThrow(/Não foi possível/);
    expect(cookie.set).not.toHaveBeenCalled();
  });
  it("meta serializa a data civil sem deslocar o dia pelo fuso", async () => {
    await createWish({
      name: "Livros",
      desiredValue: 100,
      targetDate: new Date(2026, 9, 15),
    });
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({
      targetDate: "2026-10-15",
    });
  });
});
