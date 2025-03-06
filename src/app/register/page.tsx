"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormInput } from "@/components/form/FormInput";
import { PasswordInput } from "@/components/form/PasswordInput";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log("Cadastro:", data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pb-60">
      <div className="bg-white dark:bg-[#1F2937] p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-6">
          Criar Conta
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Nome"
            register={register("name")}
            error={errors.name?.message}
          />
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
            Criar Conta
          </Button>
        </form>
        <p className="mt-4 text-sm text-[#6B7280] dark:text-gray-400">
          Já tem conta?{" "}
          <Link href="/login" className="text-[#3B82F6] hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
