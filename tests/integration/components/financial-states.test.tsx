// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TotalBalance } from "@/components/financial/total-balance";
import { PeriodTotals } from "@/components/financial/period-totals";
import { CardInvoices } from "@/components/cards/card-invoices";
import { EventList } from "@/components/calendar/event-list";
import { WishDialog } from "@/components/wishlist/create-wish-dialog";
import { getTotalBalance } from "@/actions/transaction/search-transactions";
import type { CardInvoice } from "@/models/card.model";
import type { CalendarEvent } from "@/models/calendar.model";

vi.mock("@/actions/transaction/search-transactions", () => ({ getTotalBalance: vi.fn() }));
vi.mock("@/providers/category-provider", () => ({ useCategories: () => ({ categoryLabel: (id: string) => id === "SALARY" ? "Salário" : "Outros" }) }));
const balance = { totalIncome: 100, totalExpense: 20, balance: 80, count: 2 };
const invoice: CardInvoice = { cycle: "2026-01", closingDate: "2026-01-05", dueDate: "2026-01-12", total: 10, annualFee: 0, paid: false, status: "OVERDUE", transactionIds: [], paymentDate: null, lines: [] };
const event: CalendarEvent = { id: "income:1", sourceId: "1", dueDate: "2026-10-15", periodKey: "MONTHLY:2026-10", description: "Salário mensal", amount: 100, category: "SALARY", type: "INCOME", status: "PENDING" };
const renderBalance = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(<QueryClientProvider client={client}><TotalBalance /></QueryClientProvider>);
};
beforeEach(() => { vi.mocked(getTotalBalance).mockReset(); });

describe("Estados e ações dos blocos financeiros", () => {
  it("mostra carregamento sem apresentar saldo zero como se fosse dado real", () => {
    vi.mocked(getTotalBalance).mockReturnValue(new Promise(() => {}));
    renderBalance();
    expect(screen.getByRole("status")).toHaveTextContent("Carregando saldo total");
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
  });
  it("mostra falha e recupera o saldo com tentativa explícita", async () => {
    vi.mocked(getTotalBalance).mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(balance);
    renderBalance();
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar o saldo total");
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText(/80,00/)).toBeInTheDocument();
    expect(getTotalBalance).toHaveBeenCalledTimes(2);
  });
  it("diferencia saldo total dos resultados filtrados", () => {
    render(<PeriodTotals balance={-10} income={10} expense={20} filtered />);
    expect(screen.getByText("Resultado filtrado")).toBeInTheDocument();
    expect(screen.getByText("Entradas filtradas")).toBeInTheDocument();
    expect(screen.getByText(/-.*10,00/)).toBeInTheDocument();
    expect(screen.queryByText("Saldo total")).not.toBeInTheDocument();
  });
  it("fatura fechada pode ser paga e o comando é bloqueado durante a gravação", async () => {
    const onPay = vi.fn();
    const view = render(<CardInvoices invoices={[invoice]} busy={false} onPay={onPay} />);
    await userEvent.click(screen.getByRole("button", { name: "Marcar como paga" }));
    expect(onPay).toHaveBeenCalledWith("2026-01");
    view.rerender(<CardInvoices invoices={[invoice]} busy onPay={onPay} />);
    expect(screen.getByRole("button", { name: "Marcar como paga" })).toBeDisabled();
  });
  it("fatura aberta ou já paga não oferece novo pagamento", () => {
    render(<CardInvoices invoices={[{ ...invoice, cycle: "2099-01", closingDate: "2099-01-05" }, { ...invoice, cycle: "2025-12", paid: true, status: "PAID" }]} busy={false} onPay={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Marcar como paga" })).not.toBeInTheDocument();
  });
  it("agenda só oferece recebimento para receitas pendentes", async () => {
    const onReceive = vi.fn();
    render(<EventList events={[event, { ...event, id: "settled", status: "SETTLED", description: "Receita recebida", actualAmount: 90 }]} onReceive={onReceive} />);
    expect(screen.getAllByRole("button", { name: "Confirmar recebimento" })).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "Confirmar recebimento" }));
    expect(onReceive).toHaveBeenCalledWith(event);
    expect(screen.getByText(/90,00/)).toBeInTheDocument();
  });
  it("agenda diferencia gerenciamento de fatura e de despesa fixa", () => {
    render(<EventList events={[{ ...event, id: "card:one", sourceId: "card/id", type: "EXPENSE" }, { ...event, id: "fixed", type: "EXPENSE" }]} onReceive={vi.fn()} />);
    expect(screen.getByRole("link", { name: /Gerenciar fatura/ })).toHaveAttribute("href", "/cards?cardId=card%2Fid");
    expect(screen.getByRole("link", { name: /Gerenciar pagamento/ })).toHaveAttribute("href", "/fixed-expenses");
  });
  it("agenda vazia mantém orientação para o usuário", () => {
    render(<EventList events={[]} onReceive={vi.fn()} />);
    expect(screen.getByText("Nenhum compromisso neste dia.")).toBeInTheDocument();
  });
  it("formulário de meta valida preço e só fecha após salvar com sucesso", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    render(<WishDialog open onOpenChange={onOpenChange} onSubmit={onSubmit} loading={false} />);
    const dialog = within(screen.getByRole("dialog"));
    await userEvent.click(dialog.getByRole("button", { name: "Salvar" }));
    expect(await dialog.findByText("O valor desejado deve ser positivo.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(dialog.getByLabelText("Nome"), "Livros");
    await userEvent.clear(dialog.getByLabelText("Preço"));
    await userEvent.type(dialog.getByLabelText("Preço"), "100.25");
    await userEvent.click(dialog.getByRole("button", { name: "Salvar" }));
    expect(onSubmit).toHaveBeenCalledWith({ name: "Livros", desiredValue: 100.25, targetDate: null });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
