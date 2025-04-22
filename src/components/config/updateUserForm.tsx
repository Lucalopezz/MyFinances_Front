"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "../form/FormInput";
import { PasswordInput } from "../form/PasswordInput";
import {
  UpdateUserInput,
  updateUserSchema,
  User,
} from "@/interfaces/user.interface";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserAction } from "@/app/config/_actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}
interface UpdateUserFormProps {
  user: User;
}

export default function UpdateUserForm({ user }: UpdateUserFormProps) {
    const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
    },
  });

  const onSubmit = async (data: UpdateUserInput) => {
    try {
      await updateUserAction(data);
      toast.success("Usuário atualizado com sucesso!");
      router.push('/'); 
    } catch (error) {
      toast.error("Erro ao atualizar usuário");
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto rounded-lg shadow-md p-6 bg-gray-800/60">
        <div className="flex items-center mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold ml-2">Configurações</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Nome"
            register={register("name", {
              required: "Nome é obrigatório",
              minLength: { value: 3, message: "Mínimo 3 caracteres" },
              maxLength: { value: 50, message: "Máximo 50 caracteres" },
            })}
            error={errors.name?.message}
          />

          <PasswordInput
            label="Nova Senha"
            register={register("password", {
              minLength: { value: 8, message: "Mínimo 8 caracteres" },
              maxLength: { value: 128, message: "Máximo 128 caracteres" },
            })}
            error={errors.password?.message}
          />

          <PasswordInput
            label="Confirmar Nova Senha"
            register={register("confirmPassword", {
              minLength: { value: 8, message: "Mínimo 8 caracteres" },
              maxLength: { value: 128, message: "Máximo 128 caracteres" },
            })}
            error={errors.confirmPassword?.message}
          />

          <div className="flex justify-end space-x-3 pt-6">
            <Link href="/dashboard">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
