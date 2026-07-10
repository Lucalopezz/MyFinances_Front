"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { Settings, ShieldCheck } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import {
  type UpdateUserInput,
  updateUserSchema,
  type User,
} from "@/models/user.model";
import { updateUserAction } from "@/actions/user/update-user-action";

import { AccountCard } from "./account-card";
import { NotificationsCard } from "./notifications-card";
import { PreferencesCard } from "./preferences-card";

interface UpdateUserFormProps {
  user: User;
}

const PREFERENCES_STORAGE_KEY = "mf_display_preferences";

export default function UpdateUserForm({ user }: UpdateUserFormProps) {
  const { theme, setTheme } = useTheme();
  const [compactMode, setCompactMode] = useState(false);
  const [showReadNotifications, setShowReadNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);
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
    } catch {
      toast.error("Erro ao atualizar usuário");
    }
  };

  useEffect(() => {
    const preferences = localStorage.getItem(PREFERENCES_STORAGE_KEY);

    if (preferences) {
      try {
        const parsed = JSON.parse(preferences) as {
          compactMode?: boolean;
          showReadNotifications?: boolean;
        };
        setCompactMode(Boolean(parsed.compactMode));
        setShowReadNotifications(Boolean(parsed.showReadNotifications));
      } catch {
        localStorage.removeItem(PREFERENCES_STORAGE_KEY);
      }
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ compactMode, showReadNotifications }),
    );
  }, [compactMode, mounted, showReadNotifications]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <ConfigHeader />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <div className="flex flex-col gap-6">
          <AccountCard
            errors={errors}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            register={register}
            user={user}
          />

          <PreferencesCard
            compactMode={compactMode}
            setCompactMode={setCompactMode}
            setShowReadNotifications={setShowReadNotifications}
            setTheme={setTheme}
            showReadNotifications={showReadNotifications}
            theme={theme}
          />
        </div>

        <NotificationsCard
          compactMode={compactMode}
          showReadNotifications={showReadNotifications}
        />
      </div>
    </div>
  );
}

function ConfigHeader() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        <Settings className="size-4" />
        Preferências da conta
      </div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-gray-900 dark:text-white">
            Configurações
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Gerencie seus dados de acesso, preferências de exibição e
            notificações abertas.
          </p>
        </div>
        <Badge
          variant="outline"
          className="gap-2 border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700 dark:border-blue-800/60 dark:bg-blue-800/50 dark:text-blue-300"
        >
          <ShieldCheck className="size-3.5 text-blue-600 dark:text-blue-300" />
          Sessão protegida
        </Badge>
      </div>
    </div>
  );
}
