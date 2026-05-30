import { LoginFormData } from "@/schemas/auth/login.schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { loginAction } from "@/actions/login/login-action";

export const useLogin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await loginAction({ email: data.email, password: data.password });

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
