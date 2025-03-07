"use client";
import { LoginFormData, LoginSchema } from "@/schemas/auth/login.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormInput } from "@/components/form/FormInput";
import { PasswordInput } from "@/components/form/PasswordInput";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/queries/useLogin";
import { LoadingState } from "@/components/LoadingState";
import toast from "react-hot-toast";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });
  const { handleLogin, loading } = useAuth();

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen flex items-center justify-center pb-60">
      <div className="bg-white dark:bg-[#1F2937] p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
          <FormInput
            label="E-mail"
            type="email"
            register={register("email")}
            error={errors.email?.message}
          />
          <PasswordInput
            label="Senha"
            register={register("password")}
            error={errors.password?.message}
          />
          <Button
            type="submit"
            className="w-full bg-[#10B981] hover:bg-[#059669] text-white"
          >
            Entrar
          </Button>
        </form>
        <p className="mt-4 text-sm text-[#6B7280] dark:text-gray-400">
          Não tem conta?{" "}
          <Link href="/register" className="text-[#3B82F6] hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
