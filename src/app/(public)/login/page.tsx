"use client";
import { LoginFormData, LoginSchema } from "@/schemas/auth/login.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormInput } from "@/components/form/form-input";
import { PasswordInput } from "@/components/form/password-input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/queries/useLogin";
import { LoadingState } from "@/components/loading-state";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });
  const { handleLogin, loading } = useLogin();

  if (loading) return <LoadingState />;

  return (
    <div className="flex w-full flex-1 items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-[#1F2937]">
        <h2 className="mb-6 text-2xl font-bold text-[#1F2937] dark:text-white">
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
