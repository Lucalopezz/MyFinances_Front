import { LoginFormData } from "@/schemas/auth/login.schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (!res.ok) {
        toast.error("Email ou senha inválidos");
        return;
      }

      await router.push("/");
      router.refresh();
      toast.success("Login realizado com sucesso!");
    } catch (error) {
      toast.error("Ocorreu um erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading };
};
