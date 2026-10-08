import { RegisterFormData } from "@/schemas/auth/register.schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useState } from "react";
import toast from "react-hot-toast";
import { createUserAction } from "@/actions/user/create-user-action";
import { useBackendConnection } from "@/providers/backend-connection-provider";

type RegisterDataWithoutConfirm = Omit<RegisterFormData, "confirmPassword">;

export function useCreateUser() {
  const [error, setError] = useState("");
  const router = useRouter();
  // O cadastro usa o mesmo estado de conexão do restante do aplicativo.
  const { ensureReady } = useBackendConnection();

  const mutation = useMutation({
    mutationFn: async (data: RegisterDataWithoutConfirm) => {
      try {
        // Primeiro aguardamos saúde, sem enviar ainda o cadastro. Uma rodada
        // pendente é compartilhada com o provider/login; esgotar o aquecimento
        // devolve uma orientação simples e não reenvia a criação da conta.
        if (!await ensureReady()) {
          throw new Error("Não foi possível criar sua conta agora. Tente novamente.");
        }
        // Criação real acontece uma vez, via Server Action, depois de a
        // preparação ter sucesso. A política de GET retry não se aplica a POST.
        return await createUserAction(data);
      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Não foi possível criar sua conta. Tente novamente.");
      }
    },
    onSuccess: async () => {
      // Navegação só ocorre depois de confirmar a criação, sem assumir que uma
      // requisição de saúde bem-sucedida significa que a conta já foi cadastrada.
      await router.push("/login");
      router.refresh();
      toast.success("Usuário criado com sucesso! Faça o login agora");
    },
    onError: (err: Error) => {
      setError(err.message || "Não foi possível criar sua conta. Tente novamente.");
    },
  });

  return {
    createUser: mutation.mutate,
    isLoading: mutation.isPending,
    error,
  };
}
