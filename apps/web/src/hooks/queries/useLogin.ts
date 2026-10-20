import { useQueryClient } from "@tanstack/react-query";
import { LoginFormData } from "@/schemas/auth/login.schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { loginAction } from "@/actions/login/login-action";
import { useBackendConnection } from "@/providers/backend-connection-provider";

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  // A disponibilidade é compartilhada com o ping global. Não expomos URL da
  // API/token no formulário nem criamos um novo timer de aquecimento aqui.
  const { ensureReady } = useBackendConnection();

  const handleLogin = async (data: LoginFormData) => {
    // loading abrange a espera de saúde e o login, mantendo o feedback do
    // formulário durante todo o processo, inclusive antes de enviar credenciais.
    setLoading(true);
    try {
      // Se já há uma verificação pendente, aguardamos a mesma Promise. Em falha
      // final, paramos antes de POST /auth; uma falta de conexão não vira erro de
      // senha nem dispara várias tentativas automáticas de autenticação.
      if (!await ensureReady()) {
        throw new Error("Não foi possível entrar agora. Tente novamente.");
      }
      // A Server Action lê/grava o cookie no servidor. Esta operação é enviada
      // uma única vez depois da preparação; não faz parte do loop de health.
      await loginAction({ email: data.email, password: data.password });

      // Só o login bem-sucedido limpa o cache, preservando isolamento entre
      // contas. Uma falha de aquecimento acima não chega a este bloco.
      await queryClient.cancelQueries();
      queryClient.clear();
      await router.push("/dashboard");
      router.refresh();
      toast.success("Login realizado com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar agora. Tente novamente.",
      );
    } finally {
      // Libera o formulário tanto em sucesso quanto em falha da preparação/login.
      setLoading(false);
    }
  };

  return { handleLogin, loading };
};
