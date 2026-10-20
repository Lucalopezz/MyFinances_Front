// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "@/app/(public)/login/page";
import RegisterPage from "@/app/(public)/register/page";
import { AuthProvider, useAuthContext } from "@/providers/auth-provider";
import { SESSION_EXPIRED_EVENT } from "@/lib/client-auth";
import { loginAction } from "@/actions/login/login-action";
import { logoutAction } from "@/actions/login/logout-action";
import { createUserAction } from "@/actions/user/create-user-action";

const boundary = vi.hoisted(() => ({
  ensureReady: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: boundary.push,
    replace: boundary.replace,
    refresh: boundary.refresh,
  }),
  usePathname: () => "/dashboard",
}));
vi.mock("@/providers/backend-connection-provider", () => ({
  useBackendConnection: () => ({ ensureReady: boundary.ensureReady }),
}));
vi.mock("@/actions/login/login-action", () => ({ loginAction: vi.fn() }));
vi.mock("@/actions/login/logout-action", () => ({ logoutAction: vi.fn() }));
vi.mock("@/actions/user/create-user-action", () => ({
  createUserAction: vi.fn(),
}));
vi.mock("react-hot-toast", () => ({
  default: { error: boundary.toastError, success: boundary.toastSuccess },
}));

function renderWithCache(component: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  client.setQueryData(["categories"], ["dados da conta anterior"]);
  const view = render(
    <QueryClientProvider client={client}>{component}</QueryClientProvider>,
  );
  return { client, ...view };
}
async function fillLogin() {
  await userEvent.type(screen.getByLabelText("E-mail"), "user@example.test");
  await userEvent.type(
    screen.getByLabelText("Senha", { exact: true }),
    "password123",
  );
}
beforeEach(() => {
  boundary.ensureReady.mockReset().mockResolvedValue(true);
  vi.mocked(loginAction).mockReset().mockResolvedValue({ ok: true });
  vi.mocked(logoutAction).mockReset().mockResolvedValue({ ok: true });
  vi.mocked(createUserAction).mockReset();
});

describe("Formulários, hooks e cache de sessão", () => {
  it("login valida campos antes de consultar disponibilidade ou enviar credenciais", async () => {
    renderWithCache(<LoginPage />);
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(
      await screen.findByText("A senha deve ter pelo menos 8 caracteres"),
    ).toBeInTheDocument();
    expect(loginAction).not.toHaveBeenCalled();
    expect(boundary.ensureReady).not.toHaveBeenCalled();
  });
  it("login bem-sucedido limpa o cache antes da navegação", async () => {
    const { client } = renderWithCache(<LoginPage />);
    await fillLogin();
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() =>
      expect(boundary.push).toHaveBeenCalledWith("/dashboard"),
    );
    expect(loginAction).toHaveBeenCalledExactlyOnceWith({
      email: "user@example.test",
      password: "password123",
    });
    expect(client.getQueryData(["categories"])).toBeUndefined();
    expect(boundary.refresh).toHaveBeenCalled();
  });
  it("API indisponível preserva cache e impede o envio de login", async () => {
    boundary.ensureReady.mockResolvedValue(false);
    const { client } = renderWithCache(<LoginPage />);
    await fillLogin();
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(boundary.toastError).toHaveBeenCalled());
    expect(loginAction).not.toHaveBeenCalled();
    expect(boundary.push).not.toHaveBeenCalled();
    expect(client.getQueryData(["categories"])).toEqual([
      "dados da conta anterior",
    ]);
  });
  it("credenciais rejeitadas mantêm formulário disponível para corrigir", async () => {
    vi.mocked(loginAction).mockRejectedValue(
      new Error("Usuário ou senha inválidos"),
    );
    renderWithCache(<LoginPage />);
    await fillLogin();
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() =>
      expect(boundary.toastError).toHaveBeenCalledWith(
        "Usuário ou senha inválidos",
      ),
    );
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
    expect(boundary.push).not.toHaveBeenCalled();
  });
  it("cadastro não envia confirmação de senha e navega somente após sucesso", async () => {
    vi.mocked(createUserAction).mockResolvedValue({
      id: "user",
      name: "Pessoa",
      email: "user@example.test",
      createdAt: new Date("2026-10-15"),
    });
    renderWithCache(<RegisterPage />);
    await userEvent.type(screen.getByLabelText("Nome"), "Pessoa");
    await fillLogin();
    await userEvent.type(
      screen.getByLabelText("Confirme sua senha"),
      "password123",
    );
    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    await waitFor(() => expect(boundary.push).toHaveBeenCalledWith("/login"));
    expect(createUserAction).toHaveBeenCalledExactlyOnceWith({
      name: "Pessoa",
      email: "user@example.test",
      password: "password123",
    });
  });
  it("cadastro bloqueia novo envio enquanto aguarda a criação da conta", async () => {
    vi.mocked(createUserAction).mockReturnValue(new Promise(() => {}));
    renderWithCache(<RegisterPage />);
    await userEvent.type(screen.getByLabelText("Nome"), "Pessoa");
    await fillLogin();
    await userEvent.type(
      screen.getByLabelText("Confirme sua senha"),
      "password123",
    );
    const submit = screen.getByRole("button", { name: "Criar conta" });
    await userEvent.click(submit);
    expect(submit).toBeDisabled();
    expect(createUserAction).toHaveBeenCalledTimes(1);
  });
  it("cadastro exibe a rejeição da API para que o usuário possa corrigir", async () => {
    vi.mocked(createUserAction).mockRejectedValue(
      new Error("E-mail já cadastrado"),
    );
    renderWithCache(<RegisterPage />);
    await userEvent.type(screen.getByLabelText("Nome"), "Pessoa");
    await fillLogin();
    await userEvent.type(
      screen.getByLabelText("Confirme sua senha"),
      "password123",
    );
    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "E-mail já cadastrado",
    );
    expect(boundary.push).not.toHaveBeenCalled();
  });
});

function SessionControls() {
  const { status, logout } = useAuthContext();
  return (
    <>
      <p role="status">{status}</p>
      <button onClick={() => void logout()}>Sair</button>
    </>
  );
}
describe("Encerramento da sessão", () => {
  it("deduplica expirações simultâneas, limpa cache e navega uma única vez", async () => {
    const { client } = renderWithCache(
      <AuthProvider>
        <SessionControls />
      </AuthProvider>,
    );
    act(() => {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    });
    await waitFor(() =>
      expect(boundary.replace).toHaveBeenCalledExactlyOnceWith("/login"),
    );
    expect(logoutAction).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(["categories"])).toBeUndefined();
    expect(screen.getByRole("status")).toHaveTextContent("unauthenticated");
  });
  it("logout local termina mesmo quando a action falha", async () => {
    vi.mocked(logoutAction).mockRejectedValue(new Error("offline"));
    renderWithCache(
      <AuthProvider>
        <SessionControls />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Sair" }));
    await waitFor(() =>
      expect(boundary.replace).toHaveBeenCalledWith("/login"),
    );
    expect(boundary.refresh).toHaveBeenCalledTimes(1);
  });
});
