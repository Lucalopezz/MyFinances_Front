// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteButton } from "@/components/transaction/delete-button";
vi.mock("react-hot-toast", () => ({ default: { promise: (work: Promise<unknown>) => work } }));

describe("Exclusão de transação", () => {
  it("identifica a ação pelo nome e permite cancelar sem excluir", async () => {
    const deleteAction = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<DeleteButton id="transaction" deleteAction={deleteAction} />);
    await userEvent.click(screen.getByRole("button", { name: "Excluir transação" }));
    expect(deleteAction).not.toHaveBeenCalled();
  });
  it("exclui somente depois da confirmação", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const deleteAction = vi.fn().mockResolvedValue(undefined);
    render(<DeleteButton id="transaction" deleteAction={deleteAction} />);
    await userEvent.click(screen.getByRole("button", { name: "Excluir transação" }));
    expect(deleteAction).toHaveBeenCalledExactlyOnceWith("transaction");
  });
  it("desabilita a ação sem identificador persistido", () => {
    render(<DeleteButton deleteAction={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Excluir transação" })).toBeDisabled();
  });
});
