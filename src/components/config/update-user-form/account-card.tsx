import { Mail, UserRound } from "lucide-react";
import {
  type FieldErrors,
  type UseFormHandleSubmit,
  type UseFormRegister,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/form/form-input";
import { PasswordInput } from "@/components/form/password-input";
import { type UpdateUserInput, type User } from "@/models/user.model";

import { ConfigCard } from "./config-card";

interface AccountCardProps {
  errors: FieldErrors<UpdateUserInput>;
  handleSubmit: UseFormHandleSubmit<UpdateUserInput>;
  isSubmitting: boolean;
  onSubmit: (data: UpdateUserInput) => Promise<void>;
  register: UseFormRegister<UpdateUserInput>;
  user: User;
}

export function AccountCard({
  errors,
  handleSubmit,
  isSubmitting,
  onSubmit,
  register,
  user,
}: AccountCardProps) {
  return (
    <ConfigCard
      description="O e-mail é exibido para conferência e não pode ser alterado por aqui."
      icon={UserRound}
      title="Dados da conta"
    >
      <div className="space-y-6">
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 text-gray-500 dark:text-gray-400" />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                E-mail
              </p>
              <p className="break-all text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.email}
              </p>
            </div>
          </div>
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

          <div className="grid gap-4 md:grid-cols-2">
            <PasswordInput
              label="Nova senha"
              register={register("password", {
                minLength: { value: 8, message: "Mínimo 8 caracteres" },
                maxLength: {
                  value: 128,
                  message: "Máximo 128 caracteres",
                },
              })}
              error={errors.password?.message}
            />

            <PasswordInput
              label="Confirmar nova senha"
              register={register("confirmPassword", {
                minLength: { value: 8, message: "Mínimo 8 caracteres" },
                maxLength: {
                  value: 128,
                  message: "Máximo 128 caracteres",
                },
              })}
              error={errors.confirmPassword?.message}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </div>
    </ConfigCard>
  );
}
