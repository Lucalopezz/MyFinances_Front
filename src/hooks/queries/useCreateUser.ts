import { RegisterFormData } from "@/schemas/auth/register.schema";
import api from "@/utils/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { redirect, useRouter } from "next/navigation";

import { useState } from "react";
import toast from "react-hot-toast";

type RegisterDataWithoutConfirm = Omit<RegisterFormData, "confirmPassword">;

export function useCreateUser() {
  const [error, setError] = useState("");
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: RegisterDataWithoutConfirm) => {
      try {
        const response = await api.post("/user", data);

        return response.data;
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(
            error.response.data.message || "Erro ao criar transição"
          );
        }
        throw new Error("Erro ao criar transição");
      }
    },
    onSuccess: async () => {
      await router.push("/login");
      router.refresh();
      toast.success("Usuário criado com sucesso! Faça o login agora");
    },
    onError: (err: Error) => {
      setError(err.message || "Algo deu errado");
    },
  });

  return {
    createUser: mutation.mutate,
    isLoading: mutation.isPending,
    error,
  };
}
