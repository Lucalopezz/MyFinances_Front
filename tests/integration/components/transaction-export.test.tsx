// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionExport } from "@/components/transaction/transaction-export";
import {
  createTransactionExport,
  getTransactionExportStatus,
} from "@/actions/export/transactions";
vi.mock("@/actions/export/transactions", () => ({
  createTransactionExport: vi.fn(),
  getTransactionExportStatus: vi.fn(),
}));
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));
beforeEach(() => {
  sessionStorage.clear();
  vi.mocked(getTransactionExportStatus).mockReset().mockResolvedValue(null);
  vi.mocked(createTransactionExport).mockReset();
});

describe("Ciclo de exportação na interface", () => {
  it.each([
    ["CSV", "CSV"],
    ["XLSX", "Excel (.xlsx)"],
    ["PDF", "PDF"],
  ] as const)(
    "mantém formato %s ao recuperar um arquivo concluído",
    async (format, label) => {
      vi.mocked(getTransactionExportStatus).mockResolvedValue({
        id: "export-id",
        status: "COMPLETED",
        progress: 100,
        error: null,
        format,
      });
      render(<TransactionExport />);
      expect(
        await screen.findByRole("link", { name: `Baixar ${label}` }),
      ).toHaveAttribute(
        "href",
        `/api/exports/transactions/export-id/download?format=${format}`,
      );
    },
  );
  it("cancelar o diálogo não solicita uma exportação", async () => {
    render(<TransactionExport />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Exportar transações" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(createTransactionExport).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("consulta o progresso e libera o download depois da conclusão", async () => {
    vi.useFakeTimers();
    vi.mocked(getTransactionExportStatus)
      .mockResolvedValueOnce({
        id: "job",
        status: "PROCESSING",
        progress: 50,
        error: null,
        format: "CSV",
      })
      .mockResolvedValue({
        id: "job",
        status: "COMPLETED",
        progress: 100,
        error: null,
        format: "CSV",
      });
    render(<TransactionExport />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(
      screen.getByRole("button", { name: "Gerando CSV... 50%" }),
    ).toBeDisabled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });
    expect(
      screen.getByRole("link", { name: "Baixar CSV" }),
    ).toBeInTheDocument();
    expect(getTransactionExportStatus).toHaveBeenCalledTimes(2);
  });
  it("falha de geração mostra mensagem e oferece nova tentativa", async () => {
    vi.mocked(getTransactionExportStatus).mockResolvedValue({
      id: "job",
      status: "FAILED",
      progress: 0,
      error: "Não foi possível gerar o arquivo.",
      format: "PDF",
    });
    render(<TransactionExport />);
    expect(
      await screen.findByRole("button", { name: "Tentar exportar" }),
    ).toBeEnabled();
    expect(
      screen.getByText("Não foi possível gerar o arquivo."),
    ).toBeInTheDocument();
  });
  it("falha ao solicitar não mantém um download ou progresso fictício", async () => {
    vi.mocked(createTransactionExport).mockRejectedValue(
      new Error("Não foi possível iniciar a exportação."),
    );
    render(<TransactionExport />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Exportar transações" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Confirmar exportação" }),
    );
    expect(
      await screen.findByText("Não foi possível iniciar a exportação."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Baixar/ }),
    ).not.toBeInTheDocument();
    expect(createTransactionExport).toHaveBeenCalledTimes(1);
  });
});
