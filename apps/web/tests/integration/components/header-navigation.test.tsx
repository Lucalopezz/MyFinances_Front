// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "@/components/header/header";
import { AuthProvider } from "@/providers/auth-provider";
import { BackendConnectionProvider } from "@/providers/backend-connection-provider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/dashboard",
}));
vi.mock("@/actions/login/logout-action", () => ({
  logoutAction: vi.fn().mockResolvedValue({ ok: true }),
}));
vi.mock("@/actions/notification/notifications", () => ({
  syncNotifications: vi.fn().mockResolvedValue({ processed: false }),
  getNotifications: vi.fn().mockResolvedValue([]),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
}));

describe("Navegação pelo perfil no cabeçalho", () => {
  it("oferece acesso às configurações por link e pelo teclado na sessão autenticada", async () => {
    // Apenas os limites de rede e Next são substituídos; o cabeçalho e seus
    // providers reais garantem que o atalho está disponível na sessão privada.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 204 }));
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const view = render(
      <QueryClientProvider client={client}>
        <BackendConnectionProvider>
          <AuthProvider>
            <Header onMenuClick={vi.fn()} />
          </AuthProvider>
        </BackendConnectionProvider>
      </QueryClientProvider>,
    );
    const header = within(screen.getByRole("banner"));
    const profile = header.getByRole("link", { name: "Configurações do usuário" });
    expect(profile).toHaveAttribute("href", "/config");

    // O perfil era um botão sem ação; a regressão também protege a descoberta
    // do destino e o acesso com Tab, sem depender de um clique com o mouse.
    const user = userEvent.setup();
    for (
      let attempt = 0;
      attempt < 8 && document.activeElement !== profile;
      attempt++
    ) {
      await user.tab();
    }
    expect(profile).toHaveFocus();
    view.unmount();
    client.clear();
  });
});
