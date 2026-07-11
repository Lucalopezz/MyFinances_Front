import { RegisterFormData } from "@/schemas/auth/register.schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useState } from "react";
import toast from "react-hot-toast";
import { createUserAction } from "@/actions/user/create-user-action";

type RegisterDataWithoutConfirm = Omit<RegisterFormData, "confirmPassword">;

export function useCreateUser() {
  const [error, setError] = useState("");
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: RegisterDataWithoutConfirm) => {
      try {
        return await createUserAction(data);
      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Não foi possível criar sua conta. Tente novamente.");
      }
    },
    onSuccess: async () => {
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
